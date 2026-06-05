import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  LEVEL_DEFAULT_PERMISSIONS,
  LEVELS,
} from '../../common/auth/level-permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { LevelHierarchyService } from '../../common/services/level-hierarchy.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { UsersRepository } from '../../database/repositories';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly levelHierarchy: LevelHierarchyService,
    private readonly i18n: I18nService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findManageableUsers(user: AuthUser, language?: string) {
    if (user.level === LEVELS.ADMIN_TOP) {
      return this.database.execute('users.findManageableUsers.top', () =>
        this.usersRepository.findManageableUsersForAdminTop(user.sub),
      );
    }

    if (user.level === LEVELS.ADMIN_MIDDLE) {
      return this.database.execute('users.findManageableUsers.middle', () =>
        this.usersRepository.findManageableUsersForAdminMiddle(user.sub),
      );
    }

    throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
  }

  async create(actor: AuthUser, dto: CreateUserDto, language?: string) {
    this.levelHierarchy.assertCanManage(actor.level, dto.level);

    if (actor.level === LEVELS.ADMIN_MIDDLE && dto.level !== LEVELS.STAFF) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
    }

    const existingUser = await this.database.execute(
      'users.create.findByEmail',
      () => this.usersRepository.findUserByEmail(dto.email),
    );

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.emailInUse', language));
    }

    const password = await bcrypt.hash(dto.password, 10);

    return this.database.execute('users.create', () =>
      this.usersRepository.create({
        name: dto.name,
        email: dto.email,
        password,
        role: dto.role,
        level: dto.level,
        permissions: dto.permissions?.length
          ? dto.permissions
          : [...(LEVEL_DEFAULT_PERMISSIONS[dto.level] ?? [])],
        managedById: actor.sub,
        isActive: true,
      }),
    );
  }

  async findOne(actor: AuthUser, userId: string, language?: string) {
    return this.findTargetUser(actor, userId, language);
  }

  async update(
    actor: AuthUser,
    userId: string,
    dto: UpdateUserDto,
    language?: string,
  ) {
    const target = await this.findTargetUser(actor, userId, language);

    if (dto.level !== undefined) {
      this.levelHierarchy.assertCanManage(actor.level, dto.level);

      if (actor.level === LEVELS.ADMIN_MIDDLE && dto.level !== LEVELS.STAFF) {
        throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
      }
    }

    if (dto.email && dto.email !== target.email) {
      const email = dto.email;
      const existingUser = await this.database.execute(
        'users.update.findByEmail',
        () => this.usersRepository.findUserByEmail(email),
      );

      if (existingUser) {
        throw new ConflictException(this.i18n.t('auth.emailInUse', language));
      }
    }

    const updateData: Record<string, unknown> = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.level !== undefined && !dto.permissions) {
      updateData.permissions = [
        ...(LEVEL_DEFAULT_PERMISSIONS[dto.level] ?? target.permissions),
      ];
    }

    return this.database.execute('users.update', () =>
      this.usersRepository.update(userId, updateData),
    );
  }

  async remove(actor: AuthUser, userId: string, language?: string) {
    await this.findTargetUser(actor, userId, language);

    return this.database.execute('users.remove', () =>
      this.usersRepository.delete(userId),
    );
  }

  private async findTargetUser(
    actor: AuthUser,
    userId: string,
    language?: string,
  ) {
    const target = await this.database.execute('users.findTargetUser', () =>
      this.usersRepository.findManagedTargetById(userId),
    );

    if (!target) {
      throw new NotFoundException(this.i18n.t('auth.userNotFound', language));
    }

    if (target.id === actor.sub) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
    }

    this.levelHierarchy.assertCanManage(actor.level, target.level);

    if (
      actor.level === LEVELS.ADMIN_MIDDLE &&
      target.managedById !== actor.sub
    ) {
      throw new ForbiddenException(this.i18n.t('auth.forbidden', language));
    }

    return target;
  }
}

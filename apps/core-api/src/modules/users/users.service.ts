import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import {
  LEVEL_DEFAULT_PERMISSIONS,
  LEVELS,
} from '../../common/auth/level-permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { LevelHierarchyService } from '../../common/services/level-hierarchy.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly levelHierarchy: LevelHierarchyService,
    private readonly i18n: I18nService,
  ) {}

  async findManageableUsers(user: AuthUser, language?: string) {
    if (user.level === LEVELS.ADMIN_TOP) {
      return this.database.execute('users.findManageableUsers.top', () =>
        this.prisma.user.findMany({
          where: {
            id: { not: user.sub },
          },
          select: this.userListSelect(),
          orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
        }),
      );
    }

    if (user.level === LEVELS.ADMIN_MIDDLE) {
      return this.database.execute('users.findManageableUsers.middle', () =>
        this.prisma.user.findMany({
          where: {
            managedById: user.sub,
          },
          select: this.userListSelect(),
          orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
        }),
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
      () =>
        this.prisma.user.findUnique({
          where: { email: dto.email },
          select: { id: true },
        }),
    );

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.emailInUse', language));
    }

    const password = await bcrypt.hash(dto.password, 10);

    return this.database.execute('users.create', () =>
      this.prisma.user.create({
        data: {
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
        },
        select: this.userListSelect(),
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
      const existingUser = await this.database.execute(
        'users.update.findByEmail',
        () =>
          this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
          }),
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
      this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: this.userListSelect(),
      }),
    );
  }

  async remove(actor: AuthUser, userId: string, language?: string) {
    await this.findTargetUser(actor, userId, language);

    return this.database.execute('users.remove', () =>
      this.prisma.user.delete({
        where: { id: userId },
        select: this.userListSelect(),
      }),
    );
  }

  private async findTargetUser(
    actor: AuthUser,
    userId: string,
    language?: string,
  ) {
    const target = await this.database.execute('users.findTargetUser', () =>
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...this.userListSelect(),
          managedById: true,
          permissions: true,
        },
      }),
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

  private userListSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      level: true,
      permissions: true,
      isActive: true,
      managedById: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}

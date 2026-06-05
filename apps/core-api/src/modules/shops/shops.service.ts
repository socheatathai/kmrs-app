import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { DatabaseService } from '../../common/services/database.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import { ShopsRepository } from '../../database/repositories';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly accessControl: AccessControlService,
    private readonly planLimitService: PlanLimitService,
    private readonly i18n: I18nService,
    private readonly shopsRepository: ShopsRepository,
  ) {}

  async findMine(user: AuthUser) {
    if (user.role === 'SUPER_ADMIN') {
      return this.database.execute('shops.findMine.all', () =>
        this.shopsRepository.findAll(),
      );
    }

    if (user.role === 'MERCHANT_OWNER') {
      return this.database.execute('shops.findMine.owner', () =>
        this.shopsRepository.findManyByOwnerId(user.sub),
      );
    }

    return this.database.execute('shops.findMine.staff', () =>
      this.shopsRepository.findManyByMemberUserId(user.sub),
    );
  }

  async create(user: AuthUser, dto: CreateShopDto, language?: string) {
    await this.accessControl.assertPermission(
      user,
      PERMISSIONS.shopsManage,
      undefined,
      language,
    );
    await this.planLimitService.assertCanCreateShop(user.sub, language);

    const existingSlug = await this.database.execute(
      'shops.create.findSlug',
      () => this.shopsRepository.findBySlug(dto.slug),
    );

    if (existingSlug) {
      throw new ConflictException(this.i18n.t('shop.slugInUse', language));
    }

    return this.database.execute('shops.create', () =>
      this.shopsRepository.create({
        ownerId: user.sub,
        ...dto,
      }),
    );
  }

  async findOneForUser(user: AuthUser, shopId: string, language?: string) {
    await this.accessControl.assertShopAccess(
      user,
      shopId,
      PERMISSIONS.shopSettingsView,
      language,
    );

    const shop = await this.database.execute('shops.findOneForOwner', () =>
      this.shopsRepository.findDetailById(shopId),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('shop.notFound'));
    }

    return shop;
  }

  async update(
    user: AuthUser,
    shopId: string,
    dto: UpdateShopDto,
    language?: string,
  ) {
    await this.accessControl.assertShopAccess(
      user,
      shopId,
      PERMISSIONS.shopSettingsManage,
      language,
    );

    if (dto.slug) {
      const slug = dto.slug;
      const existingSlug = await this.database.execute(
        'shops.update.findSlug',
        async () => {
          const shop = await this.shopsRepository.findBySlug(slug);
          return shop?.id === shopId ? null : shop;
        },
      );

      if (existingSlug) {
        throw new ConflictException(this.i18n.t('shop.slugReserved', language));
      }
    }

    return this.database.execute('shops.update', () =>
      this.shopsRepository.update(shopId, dto),
    );
  }

  async archive(user: AuthUser, shopId: string, language?: string) {
    await this.accessControl.assertShopAccess(
      user,
      shopId,
      PERMISSIONS.shopSettingsManage,
      language,
    );

    return this.database.execute('shops.archive', () =>
      this.shopsRepository.update(shopId, { isActive: false }),
    );
  }

  async ensureAccess(
    user: AuthUser,
    shopId: string,
    permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
    language?: string,
  ) {
    try {
      return await this.accessControl.assertShopAccess(
        user,
        shopId,
        permission,
        language,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }
}

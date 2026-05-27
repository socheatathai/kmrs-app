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
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly accessControl: AccessControlService,
    private readonly planLimitService: PlanLimitService,
    private readonly i18n: I18nService,
  ) {}

  async findMine(user: AuthUser) {
    if (user.role === 'SUPER_ADMIN') {
      return this.database.execute('shops.findMine.all', () =>
        this.prisma.shop.findMany({
          orderBy: { createdAt: 'desc' },
        }),
      );
    }

    if (user.role === 'MERCHANT_OWNER') {
      return this.database.execute('shops.findMine.owner', () =>
        this.prisma.shop.findMany({
          where: { ownerId: user.sub },
          orderBy: { createdAt: 'desc' },
        }),
      );
    }

    return this.database.execute('shops.findMine.staff', () =>
      this.prisma.shop.findMany({
        where: {
          members: {
            some: {
              userId: user.sub,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
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
      () =>
        this.prisma.shop.findUnique({
          where: { slug: dto.slug },
        }),
    );

    if (existingSlug) {
      throw new ConflictException(this.i18n.t('shop.slugInUse', language));
    }

    return this.database.execute('shops.create', () =>
      this.prisma.shop.create({
        data: {
          ownerId: user.sub,
          ...dto,
        },
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
      this.prisma.shop.findUnique({
        where: {
          id: shopId,
        },
        include: {
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          products: {
            orderBy: { sortOrder: 'asc' },
          },
          qrCodes: true,
        },
      }),
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
      const existingSlug = await this.database.execute(
        'shops.update.findSlug',
        () =>
          this.prisma.shop.findFirst({
            where: {
              slug: dto.slug,
              id: { not: shopId },
            },
          }),
      );

      if (existingSlug) {
        throw new ConflictException(this.i18n.t('shop.slugReserved', language));
      }
    }

    return this.database.execute('shops.update', () =>
      this.prisma.shop.update({
        where: { id: shopId },
        data: dto,
      }),
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
      this.prisma.shop.update({
        where: { id: shopId },
        data: { isActive: false },
      }),
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

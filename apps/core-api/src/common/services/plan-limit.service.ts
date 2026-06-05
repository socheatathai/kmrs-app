import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { DatabaseService } from './database.service';
import { SubscriptionAccessService } from './subscription-access.service';

@Injectable()
export class PlanLimitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly subscriptionAccessService: SubscriptionAccessService,
    private readonly i18n: I18nService,
  ) {}

  async assertCanCreateShop(ownerId: string, language?: string) {
    const plan = await this.subscriptionAccessService.getActivePlan(
      ownerId,
      language,
    );
    const activeShopCount = await this.database.execute(
      'planLimit.assertCanCreateShop.count',
      () =>
        this.prisma.shop.count({
          where: { ownerId, isActive: true },
        }),
    );

    if (activeShopCount >= plan.maxShops) {
      throw new ForbiddenException(this.i18n.t('shop.limitReached', language));
    }
  }

  async assertCanCreateProduct(ownerId: string, language?: string) {
    const plan = await this.subscriptionAccessService.getActivePlan(
      ownerId,
      language,
    );
    const productCount = await this.database.execute(
      'planLimit.assertCanCreateProduct.count',
      () =>
        this.prisma.product.count({
          where: {
            shop: {
              ownerId,
            },
          },
        }),
    );

    if (productCount >= plan.maxProducts) {
      throw new ForbiddenException(
        this.i18n.t('product.limitReached', language),
      );
    }
  }

  async assertCanCreateQrCode(ownerId: string, language?: string) {
    const plan = await this.subscriptionAccessService.getActivePlan(
      ownerId,
      language,
    );
    const qrCodeCount = await this.database.execute(
      'planLimit.assertCanCreateQrCode.count',
      () =>
        this.prisma.qrCode.count({
          where: {
            shop: {
              ownerId,
            },
          },
        }),
    );

    if (qrCodeCount >= plan.maxQrCodes) {
      throw new ForbiddenException(
        this.i18n.t('qrcode.limitReached', language),
      );
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

import { I18nService } from '../i18n/i18n.service';
import { DatabaseService } from './database.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class SubscriptionAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly i18n: I18nService,
  ) {}

  async getActivePlan(userId: string, language?: string) {
    const subscription = await this.database.execute(
      'subscriptionAccess.getActivePlan',
      () =>
        this.prisma.subscription.findFirst({
          where: {
            userId,
            status: SubscriptionStatus.ACTIVE,
            OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        }),
    );

    if (!subscription) {
      throw new BadRequestException(
        this.i18n.t('subscription.activeRequired', language),
      );
    }

    return subscription.plan;
  }
}

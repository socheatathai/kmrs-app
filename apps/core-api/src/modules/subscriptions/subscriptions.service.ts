import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { SubscriptionAccessService } from '../../common/services/subscription-access.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly subscriptionAccessService: SubscriptionAccessService,
    private readonly i18n: I18nService,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto, language?: string) {
    const plan = await this.database.execute(
      'subscriptions.create.findPlan',
      () =>
        this.prisma.plan.findFirst({
          where: {
            id: dto.planId,
            isActive: true,
          },
        }),
    );

    if (!plan) {
      throw new NotFoundException(this.i18n.t('plan.notFound', language));
    }

    if (dto.expiredAt && new Date(dto.expiredAt) <= new Date()) {
      throw new BadRequestException(
        this.i18n.t('subscription.expiredDateInvalid', language),
      );
    }

    const activeSubscription = await this.database.execute(
      'subscriptions.create.findActiveSubscription',
      () =>
        this.prisma.subscription.findFirst({
          where: {
            userId,
            status: SubscriptionStatus.ACTIVE,
            OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
          },
        }),
    );

    if (activeSubscription) {
      throw new BadRequestException(
        this.i18n.t('subscription.activeExists', language),
      );
    }

    return this.database.execute('subscriptions.create.transaction', () =>
      this.prisma.$transaction(async (tx) => {
        await tx.subscription.updateMany({
          where: {
            userId,
            status: SubscriptionStatus.ACTIVE,
            expiredAt: { lte: new Date() },
          },
          data: { status: SubscriptionStatus.EXPIRED },
        });

        return tx.subscription.create({
          data: {
            userId,
            planId: dto.planId,
            status: SubscriptionStatus.ACTIVE,
            expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
          },
          include: {
            plan: true,
          },
        });
      }),
    );
  }

  findMine(userId: string) {
    return this.database.execute('subscriptions.findMine', () =>
      this.prisma.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findCurrent(userId: string, language?: string) {
    const subscription = await this.database.execute(
      'subscriptions.findCurrent',
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
      throw new NotFoundException(
        this.i18n.t('subscription.notFound', language),
      );
    }

    return subscription;
  }

  async getActivePlan(userId: string, language?: string) {
    return this.subscriptionAccessService.getActivePlan(userId, language);
  }

  async cancel(
    userId: string,
    subscriptionId: string,
    dto: CancelSubscriptionDto,
    language?: string,
  ) {
    const subscription = await this.database.execute(
      'subscriptions.cancel.findSubscription',
      () =>
        this.prisma.subscription.findFirst({
          where: {
            id: subscriptionId,
            userId,
          },
        }),
    );

    if (!subscription) {
      throw new NotFoundException(
        this.i18n.t('subscription.notFound', language),
      );
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        this.i18n.t('subscription.alreadyCancelled', language),
      );
    }

    const updatedAt = dto.cancelledAt ? new Date(dto.cancelledAt) : new Date();

    return this.database.execute(
      'subscriptions.cancel.updateSubscription',
      () =>
        this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: SubscriptionStatus.CANCELLED,
            expiredAt: subscription.expiredAt ?? updatedAt,
          },
          include: { plan: true },
        }),
    );
  }
}

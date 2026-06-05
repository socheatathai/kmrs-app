import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { SubscriptionAccessService } from '../../common/services/subscription-access.service';
import {
  PlansRepository,
  SubscriptionsRepository,
} from '../../database/repositories';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly subscriptionAccessService: SubscriptionAccessService,
    private readonly i18n: I18nService,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto, language?: string) {
    const plan = await this.database.execute(
      'subscriptions.create.findPlan',
      () => this.plansRepository.findActivePlanById(dto.planId),
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
      () => this.subscriptionsRepository.findActiveByUserId(userId),
    );

    if (activeSubscription) {
      throw new BadRequestException(
        this.i18n.t('subscription.activeExists', language),
      );
    }

    return this.database.execute('subscriptions.create.transaction', () =>
      this.subscriptionsRepository.createActiveForUser(
        userId,
        dto.planId,
        dto.expiredAt ? new Date(dto.expiredAt) : null,
      ),
    );
  }

  findMine(userId: string) {
    return this.database.execute('subscriptions.findMine', () =>
      this.subscriptionsRepository.findManyByUserId(userId),
    );
  }

  async findCurrent(userId: string, language?: string) {
    const subscription = await this.database.execute(
      'subscriptions.findCurrent',
      () => this.subscriptionsRepository.findActiveWithPlanByUserId(userId),
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
      () => this.subscriptionsRepository.findByIdForUser(subscriptionId, userId),
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
        this.subscriptionsRepository.cancelById(
          subscriptionId,
          subscription.expiredAt ?? updatedAt,
        ),
    );
  }
}

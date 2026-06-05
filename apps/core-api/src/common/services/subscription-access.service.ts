import { BadRequestException, Injectable } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service';
import { DatabaseService } from './database.service';
import { SubscriptionsRepository } from '../../database/repositories';

@Injectable()
export class SubscriptionAccessService {
  constructor(
    private readonly database: DatabaseService,
    private readonly i18n: I18nService,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async getActivePlan(userId: string, language?: string) {
    const subscription = await this.database.execute(
      'subscriptionAccess.getActivePlan',
      () => this.subscriptionsRepository.findActiveWithPlanByUserId(userId),
    );

    if (!subscription) {
      throw new BadRequestException(
        this.i18n.t('subscription.activeRequired', language),
      );
    }

    return subscription.plan;
  }
}

import { ForbiddenException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import { DatabaseService } from './database.service';
import { PlanLimitService } from './plan-limit.service';
import { SubscriptionAccessService } from './subscription-access.service';

describe('PlanLimitService', () => {
  const prisma = {
    shop: { count: jest.fn() },
    product: { count: jest.fn() },
    qrCode: { count: jest.fn() },
  } as unknown as PrismaService;
  const database = {
    execute: jest.fn(
      async (_operation: string, handler: () => Promise<unknown>) => handler(),
    ),
  } as unknown as DatabaseService;
  const subscriptionAccessService = {
    getActivePlan: jest.fn(),
  } as unknown as SubscriptionAccessService;
  const i18n = {
    t: jest.fn((key: string) => key),
  } as unknown as I18nService;

  let service: PlanLimitService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlanLimitService(
      prisma,
      database,
      subscriptionAccessService,
      i18n,
    );
  });

  it('throws when shop count reaches the plan limit', async () => {
    subscriptionAccessService.getActivePlan = jest.fn().mockResolvedValue({
      maxShops: 1,
    });
    prisma.shop.count = jest.fn().mockResolvedValue(1);

    await expect(
      service.assertCanCreateShop('merchant-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows product creation below the plan limit', async () => {
    subscriptionAccessService.getActivePlan = jest.fn().mockResolvedValue({
      maxProducts: 10,
    });
    prisma.product.count = jest.fn().mockResolvedValue(3);

    await expect(
      service.assertCanCreateProduct('merchant-1'),
    ).resolves.toBeUndefined();
  });
});

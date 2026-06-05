import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByUserId(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
      },
    });
  }

  findActiveWithPlanByUserId(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createActiveForUser(userId: string, planId: string, expiredAt: Date | null) {
    return this.prisma.$transaction(async (tx) => {
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
          planId,
          status: SubscriptionStatus.ACTIVE,
          expiredAt,
        },
        include: { plan: true },
      });
    });
  }

  findManyByUserId(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  cancelById(id: string, expiredAt: Date) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        expiredAt,
      },
      include: { plan: true },
    });
  }
}

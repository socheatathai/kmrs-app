import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveMembershipsByUserId(userId: string) {
    return this.prisma.shopMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        permissions: true,
        role: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findActiveMembershipPermissionByUserIdAndShopId(userId: string, shopId: string) {
    return this.prisma.shopMember.findFirst({
      where: {
        userId,
        shopId,
        isActive: true,
      },
      select: {
        permissions: true,
      },
    });
  }
}

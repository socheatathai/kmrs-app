import { Injectable } from '@nestjs/common';
import type { QrCode } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QrCodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  countByOwnerId(ownerId: string) {
    return this.prisma.qrCode.count({
      where: {
        shop: {
          ownerId,
        },
      },
    });
  }

  create(data: {
    shopId: string;
    name: string;
    url: string;
    imageUrl: string;
    isActive: boolean;
  }): Promise<QrCode> {
    return this.prisma.qrCode.create({
      data,
    });
  }

  findManyByShopId(shopId: string): Promise<QrCode[]> {
    return this.prisma.qrCode.findMany({
      where: { shopId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findByIdAndShopId(id: string, shopId: string) {
    return this.prisma.qrCode.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.qrCode.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.qrCode.delete({
      where: { id },
    });
  }
}

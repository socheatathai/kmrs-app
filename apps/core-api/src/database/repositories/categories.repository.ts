import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(shopId: string, data: { name: string; sortOrder: number }) {
    return this.prisma.category.create({
      data: {
        shopId,
        name: data.name,
        sortOrder: data.sortOrder,
      },
    });
  }

  findManyByShopId(shopId: string) {
    return this.prisma.category.findMany({
      where: { shopId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findByIdAndShopId(id: string, shopId: string) {
    return this.prisma.category.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  findByIdAndShopIdWithProducts(id: string, shopId: string) {
    return this.prisma.category.findFirst({
      where: {
        id,
        shopId,
      },
      include: {
        products: {
          select: { id: true },
          take: 1,
        },
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

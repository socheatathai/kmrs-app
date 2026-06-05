import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  countByOwnerId(ownerId: string) {
    return this.prisma.product.count({
      where: {
        shop: {
          ownerId,
        },
      },
    });
  }

  create(
    shopId: string,
    data: {
      categoryId: string;
      name: string;
      description?: string;
      price: string;
      imageUrl?: string;
      imageKey?: string;
      sortOrder: number;
      isAvailable: boolean;
    },
  ) {
    return this.prisma.product.create({
      data: {
        shopId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        sortOrder: data.sortOrder,
        isAvailable: data.isAvailable,
      },
    });
  }

  findManyByShopId(shopId: string) {
    return this.prisma.product.findMany({
      where: { shopId },
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  findByIdAndShopId(id: string, shopId: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  update(id: string, data: object) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMenuBySlug(slug: string) {
    return this.prisma.shop.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        phone: true,
        address: true,
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            sortOrder: true,
            products: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    });
  }

  findActiveShopBySlug(slug: string) {
    return this.prisma.shop.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
      },
    });
  }

  findActiveCategoriesByShopId(shopId: string) {
    return this.prisma.category.findMany({
      where: {
        shopId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
    });
  }

  findAvailableProductsByShopId(shopId: string) {
    return this.prisma.product.findMany({
      where: {
        shopId,
        isAvailable: true,
        category: {
          isActive: true,
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },
      },
    });
  }

  findAvailableProductBySlugAndId(slug: string, productId: string) {
    return this.prisma.product.findFirst({
      where: {
        id: productId,
        isAvailable: true,
        shop: {
          slug,
          isActive: true,
        },
        category: {
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },
      },
    });
  }
}

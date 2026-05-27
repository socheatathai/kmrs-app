import { Injectable, NotFoundException } from '@nestjs/common';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly i18n: I18nService,
  ) {}

  async getMenu(slug: string) {
    const shop = await this.database.execute('public.getMenu.findShop', () =>
      this.prisma.shop.findFirst({
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
      }),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }

  async getCategories(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getCategories', () =>
      this.prisma.category.findMany({
        where: {
          shopId: shop.id,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      }),
    );
  }

  async getProducts(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getProducts', () =>
      this.prisma.product.findMany({
        where: {
          shopId: shop.id,
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
      }),
    );
  }

  async getProduct(slug: string, productId: string) {
    const product = await this.database.execute('public.getProduct', () =>
      this.prisma.product.findFirst({
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
      }),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound'));
    }

    return product;
  }

  async recordQrScan(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return {
      shopId: shop.id,
      slug: shop.slug,
      scannedAt: new Date().toISOString(),
    };
  }

  private async findActiveShopBySlug(slug: string) {
    const shop = await this.database.execute(
      'public.findActiveShopBySlug',
      () =>
        this.prisma.shop.findFirst({
          where: {
            slug,
            isActive: true,
          },
          select: {
            id: true,
            slug: true,
          },
        }),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }
}

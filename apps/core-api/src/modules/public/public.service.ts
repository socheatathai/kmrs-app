import { Injectable, NotFoundException } from '@nestjs/common';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PublicRepository } from '../../database/repositories';

@Injectable()
export class PublicService {
  constructor(
    private readonly database: DatabaseService,
    private readonly i18n: I18nService,
    private readonly publicRepository: PublicRepository,
  ) {}

  async getMenu(slug: string) {
    const shop = await this.database.execute('public.getMenu.findShop', () =>
      this.publicRepository.findMenuBySlug(slug),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }

  async getCategories(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getCategories', () =>
      this.publicRepository.findActiveCategoriesByShopId(shop.id),
    );
  }

  async getProducts(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getProducts', () =>
      this.publicRepository.findAvailableProductsByShopId(shop.id),
    );
  }

  async getProduct(slug: string, productId: string) {
    const product = await this.database.execute('public.getProduct', () =>
      this.publicRepository.findAvailableProductBySlugAndId(slug, productId),
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
      () => this.publicRepository.findActiveShopBySlug(slug),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }
}

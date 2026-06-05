import { Injectable, NotFoundException } from '@nestjs/common';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import {
  CategoriesRepository,
  ProductsRepository,
} from '../../database/repositories';
import { ShopsService } from '../shops/shops.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly planLimitService: PlanLimitService,
    private readonly i18n: I18nService,
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(
    user: AuthUser,
    shopId: string,
    dto: CreateProductDto,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsManage,
      language,
    );

    const category = await this.database.execute(
      'products.create.findCategory',
      () => this.categoriesRepository.findByIdAndShopId(dto.categoryId, shopId),
    );

    if (!category) {
      throw new NotFoundException(this.i18n.t('category.notFound', language));
    }

    await this.planLimitService.assertCanCreateProduct(user.sub, language);

    return this.database.execute('products.create', () =>
      this.productsRepository.create(shopId, {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        imageKey: dto.imageKey,
        sortOrder: dto.sortOrder ?? 0,
        isAvailable: dto.isAvailable ?? true,
      }),
    );
  }

  async findByShop(user: AuthUser, shopId: string, language?: string) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsView,
      language,
    );

    return this.database.execute('products.findByShop', () =>
      this.productsRepository.findManyByShopId(shopId),
    );
  }

  async update(
    user: AuthUser,
    shopId: string,
    productId: string,
    dto: UpdateProductDto,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsManage,
      language,
    );

    const product = await this.database.execute(
      'products.update.findProduct',
      () => this.productsRepository.findByIdAndShopId(productId, shopId),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound', language));
    }

    if (dto.categoryId) {
      const categoryId = dto.categoryId;
      const category = await this.database.execute(
        'products.update.findCategory',
        () => this.categoriesRepository.findByIdAndShopId(categoryId, shopId),
      );

      if (!category) {
        throw new NotFoundException(this.i18n.t('category.notFound', language));
      }
    }

    return this.database.execute('products.update', () =>
      this.productsRepository.update(productId, dto),
    );
  }

  async remove(
    user: AuthUser,
    shopId: string,
    productId: string,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsManage,
      language,
    );

    const product = await this.database.execute(
      'products.remove.findProduct',
      () => this.productsRepository.findByIdAndShopId(productId, shopId),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound', language));
    }

    return this.database.execute('products.remove', () =>
      this.productsRepository.delete(productId),
    );
  }
}

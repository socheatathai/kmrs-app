import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly planLimitService: PlanLimitService,
    private readonly i18n: I18nService,
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
      () =>
        this.prisma.category.findFirst({
          where: {
            id: dto.categoryId,
            shopId,
          },
        }),
    );

    if (!category) {
      throw new NotFoundException(this.i18n.t('category.notFound', language));
    }

    await this.planLimitService.assertCanCreateProduct(user.sub, language);

    return this.database.execute('products.create', () =>
      this.prisma.product.create({
        data: {
          shopId,
          categoryId: dto.categoryId,
          name: dto.name,
          description: dto.description,
          price: dto.price,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          sortOrder: dto.sortOrder ?? 0,
          isAvailable: dto.isAvailable ?? true,
        },
      }),
    );
  }

  async findByShop(
    user: AuthUser,
    shopId: string,
    query: ListProductsDto = {},
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsView,
      language,
    );

    if (this.shouldPaginate(query)) {
      return this.findByShopPaginated(shopId, query);
    }

    return this.database.execute('products.findByShop', () =>
      this.prisma.product.findMany({
        where: { shopId },
        include: { category: true },
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      }),
    );
  }

  async findOne(
    user: AuthUser,
    shopId: string,
    productId: string,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.productsView,
      language,
    );

    const product = await this.database.execute('products.findOne', () =>
      this.prisma.product.findFirst({
        where: { id: productId, shopId },
        include: { category: true },
      }),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound', language));
    }

    return product;
  }

  private shouldPaginate(query: ListProductsDto) {
    return Boolean(
      query.page ||
      query.limit ||
      query.search ||
      query.categoryId ||
      query.isAvailable !== undefined ||
      query.sortBy ||
      query.sortDirection,
    );
  }

  private async findByShopPaginated(shopId: string, query: ListProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.ProductWhereInput = {
      shopId,
      categoryId: query.categoryId,
      isAvailable: query.isAvailable,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { [query.sortBy ?? 'sortOrder']: query.sortDirection ?? 'asc' },
      { createdAt: 'desc' },
    ];

    const [items, total] = await this.database.execute(
      'products.findByShopPaginated',
      () =>
        this.prisma.$transaction([
          this.prisma.product.findMany({
            where,
            include: { category: true },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.product.count({ where }),
        ]),
    );

    return {
      items,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
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
      () =>
        this.prisma.product.findFirst({
          where: {
            id: productId,
            shopId,
          },
        }),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound', language));
    }

    if (dto.categoryId) {
      const category = await this.database.execute(
        'products.update.findCategory',
        () =>
          this.prisma.category.findFirst({
            where: {
              id: dto.categoryId,
              shopId,
            },
          }),
      );

      if (!category) {
        throw new NotFoundException(this.i18n.t('category.notFound', language));
      }
    }

    return this.database.execute('products.update', () =>
      this.prisma.product.update({
        where: { id: productId },
        data: dto,
      }),
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
      () =>
        this.prisma.product.findFirst({
          where: {
            id: productId,
            shopId,
          },
        }),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound', language));
    }

    return this.database.execute('products.remove', () =>
      this.prisma.product.delete({
        where: { id: productId },
      }),
    );
  }
}

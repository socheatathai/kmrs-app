import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    user: AuthUser,
    shopId: string,
    dto: CreateCategoryDto,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.categoriesManage,
      language,
    );

    return this.database.execute('categories.create', () =>
      this.prisma.category.create({
        data: {
          shopId,
          name: dto.name,
          sortOrder: dto.sortOrder ?? 0,
        },
      }),
    );
  }

  async findByShop(user: AuthUser, shopId: string, language?: string) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.categoriesView,
      language,
    );

    return this.database.execute('categories.findByShop', () =>
      this.prisma.category.findMany({
        where: { shopId },
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }

  async update(
    user: AuthUser,
    shopId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.categoriesManage,
      language,
    );

    const category = await this.database.execute(
      'categories.update.findOne',
      () =>
        this.prisma.category.findFirst({
          where: {
            id: categoryId,
            shopId,
          },
        }),
    );

    if (!category) {
      throw new NotFoundException(this.i18n.t('category.notFound', language));
    }

    return this.database.execute('categories.update', () =>
      this.prisma.category.update({
        where: { id: categoryId },
        data: dto,
      }),
    );
  }

  async remove(
    user: AuthUser,
    shopId: string,
    categoryId: string,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.categoriesManage,
      language,
    );

    const category = await this.database.execute(
      'categories.remove.findOne',
      () =>
        this.prisma.category.findFirst({
          where: {
            id: categoryId,
            shopId,
          },
          include: {
            products: {
              select: { id: true },
              take: 1,
            },
          },
        }),
    );

    if (!category) {
      throw new NotFoundException(this.i18n.t('category.notFound', language));
    }

    if (category.products.length > 0) {
      throw new BadRequestException(
        this.i18n.t('category.hasProducts', language),
      );
    }

    return this.database.execute('categories.remove', () =>
      this.prisma.category.delete({
        where: { id: categoryId },
      }),
    );
  }
}

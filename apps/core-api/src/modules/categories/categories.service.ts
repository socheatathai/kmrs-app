import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CategoriesRepository } from '../../database/repositories';
import { ShopsService } from '../shops/shops.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly i18n: I18nService,
    private readonly categoriesRepository: CategoriesRepository,
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
      this.categoriesRepository.create(shopId, {
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
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
      this.categoriesRepository.findManyByShopId(shopId),
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
      () => this.categoriesRepository.findByIdAndShopId(categoryId, shopId),
    );

    if (!category) {
      throw new NotFoundException(this.i18n.t('category.notFound', language));
    }

    return this.database.execute('categories.update', () =>
      this.categoriesRepository.update(categoryId, dto),
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
        this.categoriesRepository.findByIdAndShopIdWithProducts(
          categoryId,
          shopId,
        ),
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
      this.categoriesRepository.delete(categoryId),
    );
  }
}

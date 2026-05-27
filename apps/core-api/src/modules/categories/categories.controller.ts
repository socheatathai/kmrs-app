import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { PERMISSIONS } from '../../common/auth/permissions';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.STAFF)
@Controller('shops/:shopId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create a category in a shop' })
  @ApiOkResponse({ description: 'Created category' })
  @Permissions(PERMISSIONS.categoriesManage)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user, shopId, dto);
  }

  @ApiOperation({ summary: 'List categories for a shop' })
  @ApiOkResponse({ description: 'Shop categories' })
  @Permissions(PERMISSIONS.categoriesView)
  @Get()
  findByShop(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
  ) {
    return this.categoriesService.findByShop(user, shopId);
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiOkResponse({ description: 'Updated category' })
  @Permissions(PERMISSIONS.categoriesManage)
  @Patch(':categoryId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user, shopId, categoryId, dto);
  }

  @ApiOperation({ summary: 'Delete a category without products' })
  @ApiOkResponse({ description: 'Deleted category' })
  @Permissions(PERMISSIONS.categoriesManage)
  @Delete(':categoryId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
  ) {
    return this.categoriesService.remove(user, shopId, categoryId);
  }
}

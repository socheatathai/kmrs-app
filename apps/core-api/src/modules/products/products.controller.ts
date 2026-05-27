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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.STAFF)
@Controller('shops/:shopId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create a product in a shop' })
  @ApiOkResponse({ description: 'Created product' })
  @Permissions(PERMISSIONS.productsManage)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(user, shopId, dto);
  }

  @ApiOperation({ summary: 'List products for a shop' })
  @ApiOkResponse({ description: 'Shop products' })
  @Permissions(PERMISSIONS.productsView)
  @Get()
  findByShop(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
  ) {
    return this.productsService.findByShop(user, shopId);
  }

  @ApiOperation({ summary: 'Update a product' })
  @ApiOkResponse({ description: 'Updated product' })
  @Permissions(PERMISSIONS.productsManage)
  @Patch(':productId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(user, shopId, productId, dto);
  }

  @ApiOperation({ summary: 'Delete a product' })
  @ApiOkResponse({ description: 'Deleted product' })
  @Permissions(PERMISSIONS.productsManage)
  @Delete(':productId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.productsService.remove(user, shopId, productId);
  }
}

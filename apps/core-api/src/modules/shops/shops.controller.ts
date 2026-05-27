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

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PERMISSIONS } from '../../common/auth/permissions';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopsService } from './shops.service';

@ApiTags('Shops')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.STAFF)
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @ApiOperation({ summary: 'List shops owned by the current merchant' })
  @ApiOkResponse({ description: 'Merchant shops' })
  @Permissions(PERMISSIONS.shopsView)
  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.shopsService.findMine(user);
  }

  @ApiOperation({ summary: 'Create a shop' })
  @ApiOkResponse({ description: 'Created shop' })
  @Permissions(PERMISSIONS.shopsManage)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShopDto) {
    return this.shopsService.create(user, dto);
  }

  @ApiOperation({ summary: 'Get one owned shop with related resources' })
  @ApiOkResponse({ description: 'Shop detail' })
  @Permissions(PERMISSIONS.shopSettingsView)
  @Get(':shopId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
  ) {
    return this.shopsService.findOneForUser(user, shopId);
  }

  @ApiOperation({ summary: 'Update a shop' })
  @ApiOkResponse({ description: 'Updated shop' })
  @Permissions(PERMISSIONS.shopSettingsManage)
  @Patch(':shopId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(user, shopId, dto);
  }

  @ApiOperation({ summary: 'Archive a shop' })
  @ApiOkResponse({ description: 'Archived shop' })
  @Permissions(PERMISSIONS.shopSettingsManage)
  @Delete(':shopId')
  archive(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
  ) {
    return this.shopsService.archive(user, shopId);
  }
}

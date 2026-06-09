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
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCodesService } from './qr-codes.service';

@ApiTags('QR Codes')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.STAFF)
@Controller('shops/:shopId/qrcodes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @ApiOperation({ summary: 'Create a QR code for a shop menu' })
  @ApiOkResponse({ description: 'Created QR code' })
  @Permissions(PERMISSIONS.qrCodeCreate)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Body() dto: CreateQrCodeDto,
  ) {
    return this.qrCodesService.create(user, shopId, dto);
  }

  @ApiOperation({ summary: 'List QR codes for a shop' })
  @ApiOkResponse({ description: 'Shop QR codes' })
  @Permissions(PERMISSIONS.qrCodesView)
  @Get()
  findByShop(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
  ) {
    return this.qrCodesService.findByShop(user, shopId);
  }

  @ApiOperation({ summary: 'Update a QR code' })
  @ApiOkResponse({ description: 'Updated QR code' })
  @Permissions(PERMISSIONS.qrCodeUpdate)
  @Patch(':qrCodeId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('qrCodeId', new ParseUUIDPipe()) qrCodeId: string,
    @Body() dto: UpdateQrCodeDto,
  ) {
    return this.qrCodesService.update(user, shopId, qrCodeId, dto);
  }

  @ApiOperation({ summary: 'Delete a QR code' })
  @ApiOkResponse({ description: 'Deleted QR code' })
  @Permissions(PERMISSIONS.qrCodeDelete)
  @Delete(':qrCodeId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('shopId', new ParseUUIDPipe()) shopId: string,
    @Param('qrCodeId', new ParseUUIDPipe()) qrCodeId: string,
  ) {
    return this.qrCodesService.remove(user, shopId, qrCodeId);
  }
}

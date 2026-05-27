import {
  Body,
  Controller,
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
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.STAFF)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Create a subscription for the current user' })
  @ApiOkResponse({ description: 'Created subscription' })
  @Permissions(PERMISSIONS.subscriptionView)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.sub, dto);
  }

  @ApiOperation({ summary: 'List subscriptions for the current user' })
  @ApiOkResponse({ description: 'Subscription history' })
  @Permissions(PERMISSIONS.subscriptionView)
  @Get('me')
  findMine(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.findMine(user.sub);
  }

  @ApiOperation({ summary: 'Get current active subscription' })
  @ApiOkResponse({ description: 'Current active subscription' })
  @Permissions(PERMISSIONS.subscriptionView)
  @Get('current')
  findCurrent(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.findCurrent(user.sub);
  }

  @ApiOperation({ summary: 'Cancel one of the current user subscriptions' })
  @ApiOkResponse({ description: 'Cancelled subscription' })
  @Permissions(PERMISSIONS.subscriptionView)
  @Patch(':subscriptionId/cancel')
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('subscriptionId', new ParseUUIDPipe()) subscriptionId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancel(user.sub, subscriptionId, dto);
  }
}

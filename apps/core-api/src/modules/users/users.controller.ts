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
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List users manageable by the current actor' })
  @ApiOkResponse({ description: 'Manageable users' })
  @Permissions(PERMISSIONS.accountView)
  @Get()
  findManageableUsers(@CurrentUser() user: AuthUser) {
    return this.usersService.findManageableUsers(user);
  }

  @ApiOperation({ summary: 'Create a managed user' })
  @ApiOkResponse({ description: 'Created user' })
  @Permissions(PERMISSIONS.accountCreate)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto);
  }

  @ApiOperation({ summary: 'Get a managed user by id' })
  @ApiOkResponse({ description: 'Managed user' })
  @Permissions(PERMISSIONS.accountView)
  @Get(':userId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.usersService.findOne(user, userId);
  }

  @ApiOperation({ summary: 'Update a managed user' })
  @ApiOkResponse({ description: 'Updated user' })
  @Permissions(PERMISSIONS.accountUpdate)
  @Patch(':userId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, userId, dto);
  }

  @ApiOperation({ summary: 'Delete a managed user by email' })
  @ApiOkResponse({ description: 'Deleted user' })
  @Delete()
  remove(@CurrentUser() user: AuthUser, @Body() dto: DeleteUserDto) {
    return this.usersService.remove(user, dto.email, dto.password);
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

const AUTH_LOGIN_THROTTLE_LIMIT = parseInt(
  process.env.AUTH_LOGIN_THROTTLE_LIMIT ?? '5',
  10,
);
const AUTH_LOGIN_THROTTLE_TTL_MS = parseInt(
  process.env.AUTH_LOGIN_THROTTLE_TTL_MS ?? '60000',
  10,
);

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Register a merchant account' })
  @ApiOkResponse({ description: 'Authenticated merchant session' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: AUTH_LOGIN_THROTTLE_LIMIT,
      ttl: AUTH_LOGIN_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Authenticated merchant session' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({
    default: {
      limit: AUTH_LOGIN_THROTTLE_LIMIT,
      ttl: AUTH_LOGIN_THROTTLE_TTL_MS,
    },
  })
  @ApiOperation({ summary: 'Login or register with Google OAuth' })
  @ApiOkResponse({ description: 'Authenticated merchant session' })
  @Post('google')
  google(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user profile' })
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.sub);
  }

  @Public()
  @ApiOperation({ summary: 'Exchange a valid refresh token for a new session' })
  @ApiOkResponse({ description: 'Refreshed authenticated session' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout the current user and revoke previously issued tokens',
  })
  @ApiOkResponse({ description: 'Logout successful' })
  @Post('logout')
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.sub);
  }
}

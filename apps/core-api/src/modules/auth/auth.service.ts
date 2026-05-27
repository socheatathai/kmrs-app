import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../../common/services/database.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { LEVEL_DEFAULT_PERMISSIONS, LEVELS } from '../../common/auth/level-permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly accessControl: AccessControlService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== UserRole.MERCHANT_OWNER) {
      throw new ForbiddenException(
        this.i18n.t('auth.registrationRoleNotAllowed'),
      );
    }

    const existingUser = await this.database.execute(
      'auth.register.findUser',
      () =>
        this.prisma.user.findUnique({
          where: { email: dto.email },
        }),
    );

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.emailInUse'));
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.database.execute('auth.register.createUser', () =>
      this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password,
          role: UserRole.MERCHANT_OWNER,
          level: LEVELS.ADMIN_MIDDLE,
          permissions: [...LEVEL_DEFAULT_PERMISSIONS[LEVELS.ADMIN_MIDDLE]],
        },
      }),
    );

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.database.execute('auth.login.findUser', () =>
      this.prisma.user.findUnique({
        where: { email: dto.email },
      }),
    );

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    if (!user.isActive) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    const secret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT secret is not set');
    }

    let payload: {
      sub: string;
      tokenVersion: number;
      type: 'refresh';
    };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        tokenVersion: number;
        type: 'refresh';
      }>(refreshToken, {
        secret,
      });
    } catch {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    const user = await this.database.execute('auth.refresh.findUser', () =>
      this.prisma.user.findUnique({
        where: { id: payload.sub },
      }),
    );

    if (
      !user ||
      user.tokenVersion !== payload.tokenVersion ||
      !user.refreshTokenHash
    ) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidCredentials'));
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.database.execute('auth.me.findUser', () =>
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          level: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.userNotFound'));
    }

    const access = await this.accessControl.getAccessProfile(user.id, user.level);

    return {
      ...user,
      permissions: access.permissions,
      accessibleShops: access.shops,
    };
  }

  async logout(userId: string) {
    const user = await this.database.execute('auth.logout.findUser', () =>
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    );

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.userNotFound'));
    }

    await this.database.execute('auth.logout.bumpTokenVersion', () =>
      this.prisma.user.update({
        where: { id: userId },
        data: {
          refreshTokenHash: null,
          tokenVersion: {
            increment: 1,
          },
        },
      }),
    );

    return {
      message: this.i18n.t('auth.loggedOut'),
    };
  }

  private async buildAuthResponse(user: User) {
    const access = await this.accessControl.getAccessProfile(user.id, user.level);
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
      tokenVersion: user.tokenVersion,
    };
    const refreshPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      type: 'refresh' as const,
    };
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET');
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';

    if (!refreshSecret) {
      throw new Error('JWT secret is not set');
    }

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshTokenExpiresIn as never,
    });

    await this.database.execute('auth.tokens.storeRefreshToken', async () => {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        },
      });
    });

    return {
      accessToken: this.jwtService.sign(accessPayload),
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        permissions: access.permissions,
        accessibleShops: access.shops,
      },
    };
  }
}

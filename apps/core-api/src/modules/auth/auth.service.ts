import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRegisterSource, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { AccessControlService } from '../../common/services/access-control.service';
import {
  LEVEL_DEFAULT_PERMISSIONS,
  LEVELS,
} from '../../common/auth/level-permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const normalizeSlug = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return slug || 'shop';
};

type GoogleTokenInfo = {
  aud?: string;
  issued_to?: string;
  audience?: string;
  email?: string;
  email_verified?: 'true' | 'false' | boolean;
  verified_email?: 'true' | 'false' | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

const PASSWORD_RESET_EXPIRES_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly accessControl: AccessControlService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
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
    const baseSlug = normalizeSlug(dto.shopName);
    const shopSlug = await this.createUniqueShopSlug(baseSlug);
    const user = await this.database.execute('auth.register.createUser', () =>
      this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password,
            registerSource: UserRegisterSource.LOCAL,
            role: UserRole.MERCHANT_OWNER,
            level: LEVELS.ADMIN_MIDDLE,
            permissions: [...LEVEL_DEFAULT_PERMISSIONS[LEVELS.ADMIN_MIDDLE]],
          },
        });

        await transaction.shop.create({
          data: {
            ownerId: createdUser.id,
            name: dto.shopName,
            slug: shopSlug,
          },
        });

        return createdUser;
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
      throw new UnauthorizedException(this.i18n.t('auth.accountNotFound'));
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidPassword'));
    }

    if (!user.isActive) {
      throw new UnauthorizedException(this.i18n.t('auth.accountInactive'));
    }

    return this.buildAuthResponse(user);
  }

  async googleAuth(dto: GoogleAuthDto) {
    const profile = await this.verifyGoogleProfile(dto);
    const email = profile.email?.trim().toLowerCase();

    if (!email) {
      throw new UnauthorizedException(this.i18n.t('auth.googleEmailMissing'));
    }

    const existingUser = await this.database.execute(
      'auth.google.findUser',
      () =>
        this.prisma.user.findUnique({
          where: { email },
        }),
    );

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException(this.i18n.t('auth.accountInactive'));
      }

      if (profile.picture && existingUser.profileUrl !== profile.picture) {
        const updatedUser = await this.database.execute(
          'auth.google.updateProfile',
          () =>
            this.prisma.user.update({
              where: { id: existingUser.id },
              data: { profileUrl: profile.picture },
            }),
        );

        return this.buildAuthResponse(updatedUser);
      }

      return this.buildAuthResponse(existingUser);
    }

    const name =
      profile.name?.trim() ||
      [profile.given_name, profile.family_name]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      email.split('@')[0] ||
      'Merchant';
    const shopName = dto.shopName?.trim() || `${name} Store`;
    const shopSlug = await this.createUniqueShopSlug(normalizeSlug(shopName));
    const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

    const user = await this.database.execute('auth.google.createUser', () =>
      this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            name,
            email,
            password,
            profileUrl: profile.picture,
            registerSource: UserRegisterSource.GOOGLE,
            role: UserRole.MERCHANT_OWNER,
            level: LEVELS.ADMIN_MIDDLE,
            permissions: [...LEVEL_DEFAULT_PERMISSIONS[LEVELS.ADMIN_MIDDLE]],
          },
        });

        await transaction.shop.create({
          data: {
            ownerId: createdUser.id,
            name: shopName,
            slug: shopSlug,
          },
        });

        return createdUser;
      }),
    );

    return this.buildAuthResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.database.execute('auth.forgotPassword.findUser', () =>
      this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true, isActive: true },
      }),
    );

    if (!user || !user.isActive) {
      return {
        message: this.i18n.t('auth.passwordResetRequested'),
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);

    await this.database.execute('auth.forgotPassword.storeToken', () =>
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: resetTokenHash,
          passwordResetExpiresAt: expiresAt,
        },
      }),
    );

    await this.sendPasswordResetEmail(dto.email, resetToken);

    return {
      message: this.i18n.t('auth.passwordResetRequested'),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetTokenHash = this.hashResetToken(dto.token);
    const user = await this.database.execute(
      'auth.resetPassword.findUser',
      () =>
        this.prisma.user.findFirst({
          where: {
            passwordResetTokenHash: resetTokenHash,
            passwordResetExpiresAt: { gt: new Date() },
            isActive: true,
          },
          select: {
            id: true,
          },
        }),
    );

    if (!user) {
      throw new BadRequestException(this.i18n.t('auth.passwordResetInvalid'));
    }

    const password = await bcrypt.hash(dto.password, 10);

    await this.database.execute('auth.resetPassword.updatePassword', () =>
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          refreshTokenHash: null,
          tokenVersion: {
            increment: 1,
          },
        },
      }),
    );

    return {
      message: this.i18n.t('auth.passwordResetSuccess'),
    };
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
          profileUrl: true,
          registerSource: true,
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

    const access = await this.accessControl.getAccessProfile(
      user.id,
      user.level,
    );

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
    await this.ensureMerchantOwnerShop(user);

    const access = await this.accessControl.getAccessProfile(
      user.id,
      user.level,
    );
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
        profileUrl: user.profileUrl,
        registerSource: user.registerSource,
        role: user.role,
        level: user.level,
        permissions: access.permissions,
        accessibleShops: access.shops,
      },
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const from = this.configService.get<string>('EMAIL_FROM');
    const cmsUrl =
      this.configService.get<string>('MERCHANT_CMS_URL') ??
      'http://localhost:3001';

    if (!from) {
      this.logger.error(
        'Password reset email is not configured. Set EMAIL_FROM.',
      );
      throw new InternalServerErrorException(
        this.i18n.t('auth.passwordResetEmailFailed'),
      );
    }

    const resetUrl = `${cmsUrl.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await this.mailerService.sendMail({
        from,
        to: email,
        subject: 'Reset your KMRS password',
        html: `
          <p>Hello,</p>
          <p>Use the link below to reset your KMRS Merchant CMS password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
        text: `Reset your KMRS Merchant CMS password: ${resetUrl}`,
      });
    } catch (error) {
      this.logger.error('Password reset email failed', error);
      throw new InternalServerErrorException(
        this.i18n.t('auth.passwordResetEmailFailed'),
      );
    }
  }

  private async ensureMerchantOwnerShop(user: User) {
    if (user.role !== UserRole.MERCHANT_OWNER) {
      return;
    }

    const existingShop = await this.database.execute(
      'auth.ensureMerchantOwnerShop.findFirst',
      () =>
        this.prisma.shop.findFirst({
          where: { ownerId: user.id },
          select: { id: true },
        }),
    );

    if (existingShop) {
      return;
    }

    const shopName = `${user.name} Store`;
    const shopSlug = await this.createUniqueShopSlug(normalizeSlug(shopName));

    await this.database.execute('auth.ensureMerchantOwnerShop.create', () =>
      this.prisma.shop.create({
        data: {
          ownerId: user.id,
          name: shopName,
          slug: shopSlug,
        },
      }),
    );
  }

  private async createUniqueShopSlug(baseSlug: string) {
    for (let index = 0; index < 100; index += 1) {
      const suffix = index === 0 ? '' : `-${index + 1}`;
      const candidate = `${baseSlug.slice(0, 50 - suffix.length)}${suffix}`;
      const existingShop = await this.database.execute(
        'auth.register.findShopSlug',
        () =>
          this.prisma.shop.findUnique({
            where: { slug: candidate },
            select: { id: true },
          }),
      );

      if (!existingShop) {
        return candidate;
      }
    }

    return `${baseSlug.slice(0, 37)}-${Date.now().toString(36)}`;
  }

  private verifyGoogleProfile(dto: GoogleAuthDto) {
    if (dto.idToken) {
      return this.verifyGoogleIdToken(dto.idToken);
    }

    if (dto.accessToken) {
      return this.verifyGoogleAccessToken(dto.accessToken);
    }

    throw new BadRequestException(this.i18n.t('auth.googleInvalidToken'));
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');

    if (!clientId) {
      throw new Error('GOOGLE_OAUTH_CLIENT_ID is not set');
    }

    const claims = this.decodeGoogleIdTokenClaims(idToken);
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException(this.i18n.t('auth.googleInvalidToken'));
    }

    const tokenInfo = (await response.json()) as GoogleTokenInfo;
    const profile = {
      ...claims,
      ...tokenInfo,
      name: tokenInfo.name || claims.name,
      given_name: tokenInfo.given_name || claims.given_name,
      family_name: tokenInfo.family_name || claims.family_name,
      picture: tokenInfo.picture || claims.picture,
    };

    if (profile.aud !== clientId) {
      throw new UnauthorizedException(this.i18n.t('auth.googleInvalidToken'));
    }

    if (!this.isGoogleEmailVerified(profile)) {
      throw new BadRequestException(this.i18n.t('auth.googleEmailUnverified'));
    }

    return profile;
  }

  private async verifyGoogleAccessToken(accessToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');

    if (!clientId) {
      throw new Error('GOOGLE_OAUTH_CLIENT_ID is not set');
    }

    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
    );

    if (!tokenInfoResponse.ok) {
      throw new UnauthorizedException(this.i18n.t('auth.googleInvalidToken'));
    }

    const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;
    const audience = tokenInfo.aud || tokenInfo.audience || tokenInfo.issued_to;

    if (audience !== clientId) {
      throw new UnauthorizedException(this.i18n.t('auth.googleInvalidToken'));
    }

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new UnauthorizedException(this.i18n.t('auth.googleInvalidToken'));
    }

    const userInfo = (await userInfoResponse.json()) as GoogleTokenInfo;
    const profile = {
      ...tokenInfo,
      ...userInfo,
      email: userInfo.email || tokenInfo.email,
      email_verified: userInfo.email_verified ?? tokenInfo.email_verified,
      verified_email: tokenInfo.verified_email,
    };

    if (!this.isGoogleEmailVerified(profile)) {
      throw new BadRequestException(this.i18n.t('auth.googleEmailUnverified'));
    }

    return profile;
  }

  private isGoogleEmailVerified(profile: GoogleTokenInfo) {
    return (
      profile.email_verified === true ||
      profile.email_verified === 'true' ||
      profile.verified_email === true ||
      profile.verified_email === 'true'
    );
  }

  private decodeGoogleIdTokenClaims(idToken: string): GoogleTokenInfo {
    const [, payload] = idToken.split('.');

    if (!payload) {
      return {};
    }

    try {
      const normalizedPayload = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

      return JSON.parse(
        Buffer.from(normalizedPayload, 'base64').toString('utf8'),
      ) as GoogleTokenInfo;
    } catch {
      return {};
    }
  }
}

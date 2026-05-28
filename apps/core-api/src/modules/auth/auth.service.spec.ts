import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { I18nService } from '../../common/i18n/i18n.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const database = {
    execute: jest.fn(
      async (_operation: string, handler: () => Promise<unknown>) => handler(),
    ),
  } as unknown as DatabaseService;
  const accessControl = {
    getAccessProfile: jest.fn().mockResolvedValue({
      permissions: [],
      shops: [],
    }),
  } as unknown as AccessControlService;
  const jwtService = {
    sign: jest.fn(() => 'token'),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const i18n = {
    t: jest.fn((key: string) => key),
  } as unknown as I18nService;
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_REFRESH_SECRET' || key === 'JWT_SECRET') {
        return 'secret';
      }

      if (key === 'JWT_REFRESH_EXPIRES_IN') {
        return '30d';
      }

      return undefined;
    }),
  } as unknown as ConfigService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma,
      database,
      accessControl,
      jwtService,
      i18n,
      configService,
    );
  });

  it('rejects public registration for non-merchant roles', async () => {
    await expect(
      service.register({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'secret123',
        role: UserRole.SUPER_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate emails during registration', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        name: 'Merchant',
        email: 'merchant@example.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a token and merchant payload on registration', async () => {
    const createMock = jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Merchant',
      email: 'merchant@example.com',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [],
      isActive: true,
      tokenVersion: 0,
      password: 'hashed',
    });

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = createMock;
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const result = await service.register({
      name: 'Merchant',
      email: 'merchant@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(result.user.role).toBe(UserRole.MERCHANT_OWNER);
    expect(createMock).toHaveBeenCalled();
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'merchant@example.com',
      password: 'hashed',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [],
      isActive: true,
      tokenVersion: 0,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'merchant@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes a valid session', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-1',
      tokenVersion: 0,
      type: 'refresh',
    });
    prisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Merchant',
      email: 'merchant@example.com',
      password: 'hashed',
      refreshTokenHash: 'hashed-refresh',
      role: UserRole.MERCHANT_OWNER,
      level: 2,
      permissions: [],
      isActive: true,
      tokenVersion: 0,
    });
    prisma.user.update = jest.fn().mockResolvedValue({ id: 'user-1' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');

    const result = await service.refresh('refresh-token');

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
  });

  it('increments token version on logout', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-1' });
    const updateMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    prisma.user.update = updateMock;

    const result = await service.logout('user-1');

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        refreshTokenHash: null,
        tokenVersion: {
          increment: 1,
        },
      },
    });
    expect(result).toEqual({ message: 'auth.loggedOut' });
  });
});

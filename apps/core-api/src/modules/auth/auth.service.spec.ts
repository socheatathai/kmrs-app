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
  const userFindUnique = jest.fn();
  const userCreate = jest.fn();
  const userUpdate = jest.fn();
  const shopCreate = jest.fn();
  const shopFindUnique = jest.fn();
  const shopFindFirst = jest.fn();
  const transaction = jest.fn(
    async (
      handler: (transactionClient: {
        user: {
          findUnique: typeof userFindUnique;
          create: typeof userCreate;
          update: typeof userUpdate;
        };
        shop: {
          create: typeof shopCreate;
          findUnique: typeof shopFindUnique;
          findFirst: typeof shopFindFirst;
        };
      }) => Promise<unknown>,
    ) =>
      handler({
        user: {
          findUnique: userFindUnique,
          create: userCreate,
          update: userUpdate,
        },
        shop: {
          create: shopCreate,
          findUnique: shopFindUnique,
          findFirst: shopFindFirst,
        },
      }),
  );
  const prisma = {
    $transaction: transaction,
    user: {
      findUnique: userFindUnique,
      create: userCreate,
      update: userUpdate,
    },
    shop: {
      create: shopCreate,
      findUnique: shopFindUnique,
      findFirst: shopFindFirst,
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
  const mailerService = {
    sendMail: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userFindUnique.mockReset();
    userCreate.mockReset();
    userUpdate.mockReset();
    shopCreate.mockReset();
    shopFindUnique.mockReset();
    shopFindFirst.mockReset();
    transaction.mockClear();
    service = new AuthService(
      prisma,
      database,
      accessControl,
      jwtService,
      i18n,
      configService,
      mailerService as never,
    );
  });

  it('rejects public registration for non-merchant roles', async () => {
    await expect(
      service.register({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'secret123',
        shopName: 'Admin Store',
        role: UserRole.SUPER_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate emails during registration', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        name: 'Merchant',
        email: 'merchant@example.com',
        password: 'secret123',
        shopName: 'Sunrise Cafe',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a token and merchant payload on registration', async () => {
    userCreate.mockResolvedValue({
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
    userFindUnique.mockResolvedValue(null);
    shopFindUnique.mockResolvedValue(null);
    shopFindFirst.mockResolvedValue({ id: 'shop-1' });
    shopCreate.mockResolvedValue({
      id: 'shop-1',
      ownerId: 'user-1',
      name: 'Sunrise Cafe',
      slug: 'sunrise-cafe',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const result = await service.register({
      name: 'Merchant',
      email: 'merchant@example.com',
      password: 'secret123',
      shopName: 'Sunrise Cafe',
    });

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(result.user.role).toBe(UserRole.MERCHANT_OWNER);
    expect(userCreate).toHaveBeenCalled();
    expect(shopCreate).toHaveBeenCalledWith({
      data: {
        ownerId: 'user-1',
        name: 'Sunrise Cafe',
        slug: 'sunrise-cafe',
      },
    });
  });

  it('rejects invalid login credentials', async () => {
    userFindUnique.mockResolvedValue({
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
    userFindUnique.mockResolvedValue({
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
    userUpdate.mockResolvedValue({ id: 'user-1' });
    shopFindFirst.mockResolvedValue({ id: 'shop-1' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');

    const result = await service.refresh('refresh-token');

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
  });

  it('increments token version on logout', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });
    userUpdate.mockResolvedValue({ id: 'user-1' });

    const result = await service.logout('user-1');

    expect(userUpdate).toHaveBeenCalledWith({
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

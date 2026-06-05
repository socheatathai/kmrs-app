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
import { AuthRepository } from '../../database/repositories';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
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
  const authRepository = {
    findUserByEmail: jest.fn(),
    createMerchantOwner: jest.fn(),
    findUserTokenStateById: jest.fn(),
    updateRefreshTokenHash: jest.fn(),
    findUserById: jest.fn(),
    revokeUserTokens: jest.fn(),
  } as unknown as AuthRepository;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      database,
      accessControl,
      jwtService,
      i18n,
      configService,
      authRepository,
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
    authRepository.findUserByEmail = jest.fn().mockResolvedValue({ id: 'user-1' });

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

    authRepository.findUserByEmail = jest.fn().mockResolvedValue(null);
    authRepository.createMerchantOwner = createMock;
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const result = await service.register({
      name: 'Merchant',
      email: 'merchant@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(createMock).toHaveBeenCalled();
  });

  it('rejects invalid login credentials', async () => {
    authRepository.findUserByEmail = jest.fn().mockResolvedValue({
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
    authRepository.findUserTokenStateById = jest.fn().mockResolvedValue({
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
    authRepository.updateRefreshTokenHash = jest
      .fn()
      .mockResolvedValue({ id: 'user-1' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');

    const result = await service.refresh('refresh-token');

    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
  });

  it('increments token version on logout', async () => {
    authRepository.findUserById = jest.fn().mockResolvedValue({ id: 'user-1' });
    const revokeMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    authRepository.revokeUserTokens = revokeMock;

    const result = await service.logout('user-1');

    expect(revokeMock).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ message: 'auth.loggedOut' });
  });
});

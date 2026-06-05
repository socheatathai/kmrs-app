import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QrCode } from '@prisma/client';
import QRCode from 'qrcode';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { QrCodesRepository } from '../../database/repositories';
import { ShopsService } from '../shops/shops.service';
import { QrCodesService } from './qr-codes.service';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}));

describe('QrCodesService', () => {
  const database = {
    execute: jest.fn(
      async (_operation: string, handler: () => Promise<unknown>) => handler(),
    ),
  } as unknown as DatabaseService;
  const shopsService = {
    ensureAccess: jest.fn(),
  } as unknown as ShopsService;
  const planLimitService = {
    assertCanCreateQrCode: jest.fn(),
  } as unknown as PlanLimitService;
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;
  const i18n = {
    t: jest.fn((key: string) => key),
  } as unknown as I18nService;
  const qrCodesRepository = {
    create: jest.fn(),
  } as unknown as QrCodesRepository;

  let service: QrCodesService;
  const user: AuthUser = {
    sub: 'merchant-1',
    email: 'merchant@example.com',
    role: 'MERCHANT_OWNER',
    level: 2,
    tokenVersion: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QrCodesService(
      database,
      shopsService,
      planLimitService,
      configService,
      i18n,
      qrCodesRepository,
    );
  });

  it('creates a QR code using the configured public menu URL', async () => {
    shopsService.ensureAccess = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
      name: 'Sunrise Cafe',
    });
    planLimitService.assertCanCreateQrCode = jest
      .fn()
      .mockResolvedValue(undefined);
    configService.get = jest.fn().mockReturnValue('https://menu.example.com/');
    (QRCode.toDataURL as jest.Mock).mockResolvedValue(
      'data:image/png;base64,abc',
    );
    qrCodesRepository.create = jest
      .fn()
      .mockImplementation((data: QrCode) => Promise.resolve(data));

    const result = await service.create(
      user,
      'shop-1',
      { name: 'Front Door' },
      'en',
    );

    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      'https://menu.example.com/menu/sunrise-cafe',
    );
    expect(result.name).toBe('Front Door');
  });

  it('throws a mapped error when QR generation fails', async () => {
    shopsService.ensureAccess = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
      name: 'Sunrise Cafe',
    });
    planLimitService.assertCanCreateQrCode = jest
      .fn()
      .mockResolvedValue(undefined);
    configService.get = jest.fn().mockReturnValue('https://menu.example.com/');
    (QRCode.toDataURL as jest.Mock).mockRejectedValue(new Error('boom'));

    await expect(
      service.create(user, 'shop-1', { name: 'Front Door' }, 'en'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

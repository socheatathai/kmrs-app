import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QrCode } from '@prisma/client';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { QrCodesService } from './qr-codes.service';

const mockQrCodeToString = jest.fn<
  Promise<string>,
  [string, Record<string, unknown>]
>();
const qrCodeCreate = jest.fn();
const qrCodeFindFirst = jest.fn();
const qrCodeFindMany = jest.fn();
const qrCodeUpdate = jest.fn();
const qrCodeDelete = jest.fn();

jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toString: (...args: [string, Record<string, unknown>]) =>
      mockQrCodeToString(...args),
  },
  toString: (...args: [string, Record<string, unknown>]) =>
    mockQrCodeToString(...args),
}));

describe('QrCodesService', () => {
  const prisma = {
    qrCode: {
      create: qrCodeCreate,
      findFirst: qrCodeFindFirst,
      findMany: qrCodeFindMany,
      update: qrCodeUpdate,
      delete: qrCodeDelete,
    },
  } as unknown as PrismaService;
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

  let service: QrCodesService;
  const user: AuthUser = {
    sub: 'merchant-1',
    email: 'merchant@example.com',
    role: 'MERCHANT_OWNER',
    level: 2,
    permissions: [],
    tokenVersion: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQrCodeToString.mockReset();
    qrCodeCreate.mockReset();
    qrCodeFindFirst.mockReset();
    qrCodeFindMany.mockReset();
    qrCodeUpdate.mockReset();
    qrCodeDelete.mockReset();
    service = new QrCodesService(
      prisma,
      database,
      shopsService,
      planLimitService,
      configService,
      i18n,
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
    configService.get = jest.fn((key: string) =>
      key === 'publicMenuBaseUrl' ? 'https://menu.example.com/' : '',
    );
    mockQrCodeToString.mockResolvedValue(
      '<svg width="420" height="420"><path d="M0 0h1v1H0z"/></svg>',
    );
    qrCodeCreate.mockImplementation(({ data }: { data: QrCode }) =>
      Promise.resolve(data),
    );

    const result = await service.create(
      user,
      'shop-1',
      { name: 'Front Door' },
      'en',
    );

    expect(mockQrCodeToString).toHaveBeenCalledWith(
      'https://menu.example.com/sunrise-cafe',
      {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 420,
      },
    );
    expect(result.name).toBe('Front Door');
    const imageUrl = result.imageUrl ?? '';

    expect(imageUrl).toContain('data:image/svg+xml;base64,');
    expect(
      Buffer.from(imageUrl.split(',')[1], 'base64').toString('utf8'),
    ).toContain('Sunrise Cafe');
  });

  it('supports a configured menu path prefix', async () => {
    shopsService.ensureAccess = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
      name: 'Sunrise Cafe',
    });
    planLimitService.assertCanCreateQrCode = jest
      .fn()
      .mockResolvedValue(undefined);
    configService.get = jest.fn((key: string) =>
      key === 'publicMenuBaseUrl'
        ? 'https://menu.example.com/'
        : key === 'publicMenuPathPrefix'
          ? '/menu/'
          : '',
    );
    mockQrCodeToString.mockResolvedValue(
      '<svg width="420" height="420"><path d="M0 0h1v1H0z"/></svg>',
    );
    qrCodeCreate.mockImplementation(({ data }: { data: QrCode }) =>
      Promise.resolve(data),
    );

    await service.create(user, 'shop-1', { name: 'Front Door' }, 'en');

    expect(mockQrCodeToString).toHaveBeenCalledWith(
      'https://menu.example.com/menu/sunrise-cafe',
      {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 420,
      },
    );
  });

  it('refreshes stale QR records when listing by shop', async () => {
    shopsService.ensureAccess = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
      name: 'Sunrise Cafe',
    });
    configService.get = jest.fn((key: string) =>
      key === 'publicMenuBaseUrl' ? 'https://kmrs.tech/' : '',
    );
    const staleQrCode = {
      id: 'qr-1',
      shopId: 'shop-1',
      name: 'Counter',
      url: 'https://kmrs.tech/sunrise-cafe',
      imageUrl: 'data:image/png;base64,old',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    qrCodeFindMany.mockResolvedValue([staleQrCode]);
    qrCodeUpdate.mockImplementation(({ data }: { data: Partial<QrCode> }) =>
      Promise.resolve({ ...staleQrCode, ...data }),
    );
    mockQrCodeToString.mockResolvedValue(
      '<svg width="420" height="420"><path d="M0 0h1v1H0z"/></svg>',
    );

    const result = await service.findByShop(user, 'shop-1', 'en');

    expect(result[0]?.url).toBe('https://kmrs.tech/sunrise-cafe');
    expect(qrCodeUpdate).toHaveBeenCalledTimes(1);

    const updateCalls = qrCodeUpdate.mock.calls as unknown as Array<
      [
        {
          where: { id: string };
          data: { url: string; imageUrl: string };
        },
      ]
    >;
    const updateInput = updateCalls[0]?.[0];

    if (!updateInput) {
      throw new Error('Expected QR code update call');
    }

    expect(updateInput.where).toEqual({ id: 'qr-1' });
    expect(updateInput.data.url).toBe('https://kmrs.tech/sunrise-cafe');
    expect(updateInput.data.imageUrl).toContain('data:image/svg+xml;base64,');
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
    mockQrCodeToString.mockRejectedValue(new Error('boom'));

    await expect(
      service.create(user, 'shop-1', { name: 'Front Door' }, 'en'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

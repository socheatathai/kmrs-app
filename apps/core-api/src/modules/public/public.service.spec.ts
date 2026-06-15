import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PublicService } from './public.service';

jest.mock('qrcode', () => ({
  toString: jest.fn().mockResolvedValue('<svg><path d="M0 0h1v1H0z"/></svg>'),
}));

type PublicQrUpdateArgs = {
  where: { id: string };
  data: {
    url: string;
    imageUrl: string;
  };
  select: {
    id: true;
    name: true;
    url: true;
    imageUrl: true;
  };
};

describe('PublicService', () => {
  const prisma = {
    shop: {
      findFirst: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    qrCode: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
  const database = {
    execute: jest.fn(
      async (_operation: string, handler: () => Promise<unknown>) => handler(),
    ),
  } as unknown as DatabaseService;
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'publicMenuBaseUrl') {
        return 'https://kmrs.tech';
      }

      return '';
    }),
  } as unknown as ConfigService;
  const i18n = {
    t: jest.fn((key: string) => key),
  } as unknown as I18nService;

  let service: PublicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PublicService(prisma, database, config, i18n);
  });

  it('returns menu categories for an active shop', async () => {
    prisma.shop.findFirst = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
    });
    const findManyMock = jest
      .fn()
      .mockResolvedValue([
        { id: 'category-1', name: 'Breakfast', sortOrder: 0 },
      ]);
    prisma.category.findMany = findManyMock;

    const result = await service.getCategories('sunrise-cafe');

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        shopId: 'shop-1',
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
    });
    expect(result).toEqual([
      { id: 'category-1', name: 'Breakfast', sortOrder: 0 },
    ]);
  });

  it('returns menu products for an active shop', async () => {
    prisma.shop.findFirst = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
    });
    const findManyMock = jest.fn().mockResolvedValue([
      {
        id: 'product-1',
        name: 'Coffee',
        category: {
          id: 'category-1',
          name: 'Drinks',
          sortOrder: 0,
        },
      },
    ]);
    prisma.product.findMany = findManyMock;

    const result = await service.getProducts('sunrise-cafe');

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        shopId: 'shop-1',
        isAvailable: true,
        category: {
          isActive: true,
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        sortOrder: true,
        category: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
          },
        },
      },
    });
    expect(result).toHaveLength(1);
  });

  it('throws when the public product is not found', async () => {
    prisma.product.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      service.getProduct(
        'sunrise-cafe',
        '20bf7231-a4ac-4361-9b00-fb7dfe712d84',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns a QR scan acknowledgment for an active shop', async () => {
    prisma.shop.findFirst = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
    });

    const result = await service.recordQrScan('sunrise-cafe');

    expect(result.shopId).toBe('shop-1');
    expect(result.slug).toBe('sunrise-cafe');
    expect(result.scannedAt).toEqual(expect.any(String));
  });

  it('returns and refreshes a public QR code for an active shop', async () => {
    prisma.shop.findFirst = jest.fn().mockResolvedValue({
      id: 'shop-1',
      slug: 'sunrise-cafe',
      name: 'Sunrise Cafe',
    });
    prisma.qrCode.findFirst = jest.fn().mockResolvedValue({
      id: 'qr-1',
      name: 'Counter QR',
      url: 'https://old.example/sunrise-cafe',
      imageUrl: 'https://picsum.photos/id/237/400/400',
    });
    const updateMock = jest.fn(({ data }: PublicQrUpdateArgs) =>
      Promise.resolve({
        id: 'qr-1',
        name: 'Counter QR',
        ...data,
      }),
    );
    prisma.qrCode.update = updateMock as unknown as typeof prisma.qrCode.update;

    const result = await service.getQrCode('sunrise-cafe');

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [updateArgs] = updateMock.mock.calls[0];
    expect(updateArgs.where).toEqual({ id: 'qr-1' });
    expect(updateArgs.data.url).toBe('https://kmrs.tech/sunrise-cafe');
    expect(updateArgs.data.imageUrl).toContain('data:image/svg+xml;base64,');
    expect(updateArgs.select).toEqual({
      id: true,
      name: true,
      url: true,
      imageUrl: true,
    });
    expect(result).toEqual({
      id: 'qr-1',
      name: 'Counter QR',
      url: 'https://kmrs.tech/sunrise-cafe',
      imageUrl: updateArgs.data.imageUrl,
    });
  });
});

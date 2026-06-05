import { NotFoundException } from '@nestjs/common';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PublicService } from './public.service';

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
  } as unknown as PrismaService;
  const database = {
    execute: jest.fn(
      async (_operation: string, handler: () => Promise<unknown>) => handler(),
    ),
  } as unknown as DatabaseService;
  const i18n = {
    t: jest.fn((key: string) => key),
  } as unknown as I18nService;

  let service: PublicService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PublicService(prisma, database, i18n);
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
});

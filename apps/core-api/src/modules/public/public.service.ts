import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import QRCode from 'qrcode';

import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async getMenu(slug: string) {
    const shop = await this.database.execute('public.getMenu.findShop', () =>
      this.prisma.shop.findFirst({
        where: {
          slug,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          coverUrl: true,
          phone: true,
          address: true,
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              sortOrder: true,
              products: {
                where: { isAvailable: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  imageUrl: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      }),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }

  async getCategories(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getCategories', () =>
      this.prisma.category.findMany({
        where: {
          shopId: shop.id,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      }),
    );
  }

  async getProducts(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return this.database.execute('public.getProducts', () =>
      this.prisma.product.findMany({
        where: {
          shopId: shop.id,
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
      }),
    );
  }

  async getQrCode(slug: string) {
    const shop = await this.database.execute('public.getQrCode.findShop', () =>
      this.prisma.shop.findFirst({
        where: {
          slug,
          isActive: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    const url = this.buildMenuUrl(shop.slug);
    const qrCode = await this.database.execute('public.getQrCode', () =>
      this.prisma.qrCode.findFirst({
        where: {
          shopId: shop.id,
          isActive: true,
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          url: true,
          imageUrl: true,
        },
      }),
    );

    const hasLabeledSvg =
      qrCode?.imageUrl?.startsWith('data:image/svg+xml;base64,') ?? false;

    if (qrCode && qrCode.url === url && hasLabeledSvg) {
      return qrCode;
    }

    const imageUrl = await this.generateQrImage(url, shop.name);

    if (!qrCode) {
      return {
        id: null,
        name: `${shop.name} menu`,
        url,
        imageUrl,
      };
    }

    return this.database.execute('public.getQrCode.refreshTarget', () =>
      this.prisma.qrCode.update({
        where: { id: qrCode.id },
        data: {
          url,
          imageUrl,
        },
        select: {
          id: true,
          name: true,
          url: true,
          imageUrl: true,
        },
      }),
    );
  }

  async getProduct(slug: string, productId: string) {
    const product = await this.database.execute('public.getProduct', () =>
      this.prisma.product.findFirst({
        where: {
          id: productId,
          isAvailable: true,
          shop: {
            slug,
            isActive: true,
          },
          category: {
            isActive: true,
          },
        },
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
      }),
    );

    if (!product) {
      throw new NotFoundException(this.i18n.t('product.notFound'));
    }

    return product;
  }

  async recordQrScan(slug: string) {
    const shop = await this.findActiveShopBySlug(slug);

    return {
      shopId: shop.id,
      slug: shop.slug,
      scannedAt: new Date().toISOString(),
    };
  }

  private buildMenuUrl(shopSlug: string) {
    const publicMenuBaseUrl = this.getConfigValue(
      'publicMenuBaseUrl',
      'PUBLIC_MENU_BASE_URL',
      'https://kmrs.tech',
    );
    const publicMenuPathPrefix = this.getConfigValue(
      'publicMenuPathPrefix',
      'PUBLIC_MENU_PATH_PREFIX',
    );
    const normalizedPrefix = publicMenuPathPrefix
      .trim()
      .replace(/^\/+|\/+$/g, '');
    const path = normalizedPrefix
      ? `${normalizedPrefix}/${shopSlug}`
      : shopSlug;

    return `${publicMenuBaseUrl.replace(/\/+$/, '')}/${path}`;
  }

  private getConfigValue(
    configKey: string,
    envKey: string,
    fallback = '',
  ): string {
    const configValue = this.configService.get<string>(configKey)?.trim();
    const envValue = this.configService.get<string>(envKey)?.trim();

    return configValue || envValue || fallback;
  }

  private async generateQrImage(url: string, shopName: string) {
    try {
      const qrSvg = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 420,
      });

      return this.buildLabeledQrSvg(qrSvg, shopName, url);
    } catch {
      throw new InternalServerErrorException(
        this.i18n.t('qrcode.generationFailed'),
      );
    }
  }

  private buildLabeledQrSvg(qrSvg: string, shopName: string, url: string) {
    const qrBody = qrSvg
      .replace(/<\?xml[^>]*>/g, '')
      .replace(/<!DOCTYPE[^>]*>/g, '')
      .trim();
    const safeShopName = this.escapeXml(shopName);
    const safeUrl = this.escapeXml(url);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="560" height="680" viewBox="0 0 560 680">
      <rect width="560" height="680" rx="32" fill="#ffffff"/>
      <text x="280" y="68" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#111827">${safeShopName}</text>
      <text x="280" y="108" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" letter-spacing="2" fill="#047857">SCAN MENU</text>
      <g transform="translate(70 136)">${qrBody}</g>
      <text x="280" y="604" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#111827">Open digital menu</text>
      <text x="280" y="638" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#4b5563">${safeUrl}</text>
    </svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async findActiveShopBySlug(slug: string) {
    const shop = await this.database.execute(
      'public.findActiveShopBySlug',
      () =>
        this.prisma.shop.findFirst({
          where: {
            slug,
            isActive: true,
          },
          select: {
            id: true,
            slug: true,
          },
        }),
    );

    if (!shop) {
      throw new NotFoundException(this.i18n.t('public.menuNotFound'));
    }

    return shop;
  }
}

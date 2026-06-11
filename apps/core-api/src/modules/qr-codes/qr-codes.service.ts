import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QrCode } from '@prisma/client';
import QRCode from 'qrcode';

import { PERMISSIONS, type Permission } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ShopsService } from '../shops/shops.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

@Injectable()
export class QrCodesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly planLimitService: PlanLimitService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    user: AuthUser,
    shopId: string,
    dto: CreateQrCodeDto,
    language?: string,
  ): Promise<QrCode> {
    const shop = await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.qrCodeCreate,
      language,
    );
    await this.planLimitService.assertCanCreateQrCode(user.sub, language);

    const url = this.buildMenuUrl(shop.slug);
    const imageUrl = await this.generateQrImage(url, shop.name, language);

    return this.database.execute('qrcodes.create', () =>
      this.prisma.qrCode.create({
        data: {
          shopId,
          name: dto.name ?? `${shop.name} menu`,
          url,
          imageUrl,
          isActive: true,
        },
      }),
    );
  }

  async findByShop(
    user: AuthUser,
    shopId: string,
    language?: string,
  ): Promise<QrCode[]> {
    const shop = await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.qrCodesView,
      language,
    );

    const qrCodes = await this.database.execute('qrcodes.findByShop', () =>
      this.prisma.qrCode.findMany({
        where: { shopId },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      }),
    );

    return Promise.all(
      qrCodes.map((qrCode) =>
        this.ensureCurrentQrTarget(qrCode, shop.slug, shop.name, language),
      ),
    );
  }

  async update(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    dto: UpdateQrCodeDto,
    language?: string,
  ) {
    await this.findOwnedQrCode(
      user,
      shopId,
      qrCodeId,
      PERMISSIONS.qrCodeUpdate,
      language,
    );

    return this.database.execute('qrcodes.update', () =>
      this.prisma.qrCode.update({
        where: { id: qrCodeId },
        data: dto,
      }),
    );
  }

  async remove(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    language?: string,
  ) {
    await this.findOwnedQrCode(
      user,
      shopId,
      qrCodeId,
      PERMISSIONS.qrCodeDelete,
      language,
    );

    return this.database.execute('qrcodes.remove', () =>
      this.prisma.qrCode.delete({
        where: { id: qrCodeId },
      }),
    );
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

  private async generateQrImage(
    url: string,
    shopName: string,
    language?: string,
  ) {
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
        this.i18n.t('qrcode.generationFailed', language),
      );
    }
  }

  private async ensureCurrentQrTarget(
    qrCode: QrCode,
    shopSlug: string,
    shopName: string,
    language?: string,
  ) {
    const url = this.buildMenuUrl(shopSlug);
    const isLabeledSvg =
      qrCode.imageUrl?.startsWith('data:image/svg+xml;base64,') ?? false;

    if (qrCode.url === url && isLabeledSvg) {
      return qrCode;
    }

    const imageUrl = await this.generateQrImage(url, shopName, language);

    return this.database.execute('qrcodes.refreshTarget', () =>
      this.prisma.qrCode.update({
        where: { id: qrCode.id },
        data: {
          url,
          imageUrl,
        },
      }),
    );
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

  private async findOwnedQrCode(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    permission: Permission,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(user, shopId, permission, language);

    const qrCode = await this.database.execute('qrcodes.findOwnedQrCode', () =>
      this.prisma.qrCode.findFirst({
        where: {
          id: qrCodeId,
          shopId,
        },
      }),
    );

    if (!qrCode) {
      throw new NotFoundException(this.i18n.t('qrcode.notFound', language));
    }

    return qrCode;
  }
}

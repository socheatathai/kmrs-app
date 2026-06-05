import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QrCode } from '@prisma/client';
import QRCode from 'qrcode';

import { PERMISSIONS } from '../../common/auth/permissions';
import { I18nService } from '../../common/i18n/i18n.service';
import { DatabaseService } from '../../common/services/database.service';
import { PlanLimitService } from '../../common/services/plan-limit.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { QrCodesRepository } from '../../database/repositories';
import { ShopsService } from '../shops/shops.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

@Injectable()
export class QrCodesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly shopsService: ShopsService,
    private readonly planLimitService: PlanLimitService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly qrCodesRepository: QrCodesRepository,
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
      PERMISSIONS.qrCodesManage,
      language,
    );
    await this.planLimitService.assertCanCreateQrCode(user.sub, language);

    const url = this.buildMenuUrl(shop.slug);
    const imageUrl = await this.generateQrImage(url, language);

    return this.database.execute('qrcodes.create', () =>
      this.qrCodesRepository.create({
        shopId,
        name: dto.name ?? `${shop.name} menu`,
        url,
        imageUrl,
        isActive: true,
      }),
    );
  }

  async findByShop(
    user: AuthUser,
    shopId: string,
    language?: string,
  ): Promise<QrCode[]> {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.qrCodesView,
      language,
    );

    return this.database.execute('qrcodes.findByShop', () =>
      this.qrCodesRepository.findManyByShopId(shopId),
    );
  }

  async update(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    dto: UpdateQrCodeDto,
    language?: string,
  ) {
    await this.findOwnedQrCode(user, shopId, qrCodeId, language);

    return this.database.execute('qrcodes.update', () =>
      this.qrCodesRepository.update(qrCodeId, dto),
    );
  }

  async remove(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    language?: string,
  ) {
    await this.findOwnedQrCode(user, shopId, qrCodeId, language);

    return this.database.execute('qrcodes.remove', () =>
      this.qrCodesRepository.delete(qrCodeId),
    );
  }

  private buildMenuUrl(shopSlug: string) {
    const publicMenuBaseUrl =
      this.configService.get<string>('publicMenuBaseUrl') ??
      this.configService.get<string>('PUBLIC_MENU_BASE_URL') ??
      'https://kmrs.app';

    return `${publicMenuBaseUrl.replace(/\/+$/, '')}/menu/${shopSlug}`;
  }

  private async generateQrImage(url: string, language?: string) {
    try {
      return await QRCode.toDataURL(url);
    } catch {
      throw new InternalServerErrorException(
        this.i18n.t('qrcode.generationFailed', language),
      );
    }
  }

  private async findOwnedQrCode(
    user: AuthUser,
    shopId: string,
    qrCodeId: string,
    language?: string,
  ) {
    await this.shopsService.ensureAccess(
      user,
      shopId,
      PERMISSIONS.qrCodesManage,
      language,
    );

    const qrCode = await this.database.execute('qrcodes.findOwnedQrCode', () =>
      this.qrCodesRepository.findByIdAndShopId(qrCodeId, shopId),
    );

    if (!qrCode) {
      throw new NotFoundException(this.i18n.t('qrcode.notFound', language));
    }

    return qrCode;
  }
}

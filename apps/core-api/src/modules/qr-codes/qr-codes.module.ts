import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ShopsModule } from '../shops/shops.module';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';

@Module({
  imports: [CommonModule, ShopsModule],
  controllers: [QrCodesController],
  providers: [QrCodesService],
})
export class QrCodesModule {}

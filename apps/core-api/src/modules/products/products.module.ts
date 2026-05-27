import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ShopsModule } from '../shops/shops.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [CommonModule, ShopsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { ShopsModule } from '../shops/shops.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [CommonModule, ShopsModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

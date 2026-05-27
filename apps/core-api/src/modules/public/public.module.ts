import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [CommonModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}

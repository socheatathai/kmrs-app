import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ example: '2026-05-23T14:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  cancelledAt?: string;
}

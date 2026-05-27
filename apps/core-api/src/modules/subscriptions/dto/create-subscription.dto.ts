import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  planId!: string;

  @ApiPropertyOptional({ example: '2027-05-23T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}

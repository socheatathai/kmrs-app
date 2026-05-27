import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ListAuditLogsDto {
  @ApiPropertyOptional({ example: 'PATCH_users' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  action?: string;

  @ApiPropertyOptional({ example: 'users' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  entity?: string;

  @ApiPropertyOptional({ example: '0e4eb8be-d048-47e5-a5b3-bc4ee5406c1b' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

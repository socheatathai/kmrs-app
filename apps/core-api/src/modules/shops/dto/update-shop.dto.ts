import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateShopDto {
  @ApiPropertyOptional({ example: 'Sunrise Cafe Riverside' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'sunrise-cafe-riverside' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  @MaxLength(50)
  slug?: string;

  @ApiPropertyOptional({ example: 'Now serving dinner and desserts.', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-logo.png', nullable: true })
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-cover.png', nullable: true })
  @IsOptional()
  @IsUrl()
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: '+85512999999', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @ApiPropertyOptional({ example: 'Siem Reap, Cambodia', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

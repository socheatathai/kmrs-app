import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google Identity Services credential ID token.',
  })
  @IsJWT()
  idToken!: string;

  @ApiPropertyOptional({
    example: 'Sunrise Cafe',
    description: 'Optional shop name to use when a new merchant is created.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  shopName?: string;
}

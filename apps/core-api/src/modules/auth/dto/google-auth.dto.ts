import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiPropertyOptional({
    description: 'Google Identity Services credential ID token.',
  })
  @IsOptional()
  @IsJWT()
  idToken?: string;

  @ApiPropertyOptional({
    description: 'Google OAuth access token with openid email profile scopes.',
  })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({
    example: 'Sunrise Cafe',
    description: 'Optional shop name to use when a new merchant is created.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  shopName?: string;
}

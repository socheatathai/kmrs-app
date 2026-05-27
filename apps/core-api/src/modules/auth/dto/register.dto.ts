import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Merchant Demo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'merchant@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: [UserRole.MERCHANT_OWNER],
    example: UserRole.MERCHANT_OWNER,
    description: 'Public registration only supports merchant accounts.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

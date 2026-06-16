import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-from-forgot-password' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'newSecret123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

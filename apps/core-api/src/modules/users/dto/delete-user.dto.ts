import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '' })
  @IsString()
  password!: string;
}

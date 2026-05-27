import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImageKeyQueryDto {
  @ApiProperty({
    example: 'products/image-name.webp',
    description: 'Object key inside the Spaces bucket.',
  })
  @IsString()
  @IsNotEmpty()
  key!: string;
}

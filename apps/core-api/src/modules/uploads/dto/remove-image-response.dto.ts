import { ApiProperty } from '@nestjs/swagger';

export class RemoveImageResponseDto {
  @ApiProperty({ example: 'products/image-name.webp' })
  key!: string;

  @ApiProperty({ example: true })
  deleted!: boolean;
}

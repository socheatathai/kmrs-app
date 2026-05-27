import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example:
      'https://kmrs-assets.sgp1.digitaloceanspaces.com/products/image-name.webp',
  })
  url!: string;

  @ApiProperty({ example: 'products/image-name.webp' })
  key!: string;
}

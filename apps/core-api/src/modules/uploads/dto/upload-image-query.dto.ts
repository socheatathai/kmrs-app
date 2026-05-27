import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const UPLOAD_FOLDERS = ['products', 'shops'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class UploadImageQueryDto {
  @ApiPropertyOptional({
    enum: UPLOAD_FOLDERS,
    default: 'products',
    description: 'Destination folder inside the Spaces bucket.',
  })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: UploadFolder;
}

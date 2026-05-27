import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { ImageUploadValidationPipe } from './image-upload-validation.pipe';

@Injectable()
export class ImagesUploadValidationPipe implements PipeTransform {
  private readonly imageUploadValidationPipe = new ImageUploadValidationPipe();

  transform(value: Express.Multer.File[] | undefined) {
    if (!value || value.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    return value.map((file) => this.imageUploadValidationPipe.transform(file));
  }
}

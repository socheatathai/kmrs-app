import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ImageUploadValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);
  private readonly allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
  private readonly maxSizeBytes = 5 * 1024 * 1024;

  transform(value: Express.Multer.File | undefined) {
    if (!value) {
      throw new BadRequestException('Image file is required');
    }

    if (value.size > this.maxSizeBytes) {
      throw new BadRequestException('Image file must be 5MB or smaller');
    }

    const extension = value.originalname.split('.').pop()?.toLowerCase() ?? '';

    if (
      !this.allowedMimeTypes.has(value.mimetype) ||
      !this.allowedExtensions.has(extension)
    ) {
      throw new BadRequestException(
        'Only jpg, jpeg, png, and webp images are allowed',
      );
    }

    return value;
  }
}

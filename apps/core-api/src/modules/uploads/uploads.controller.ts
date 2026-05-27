import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { ImageUploadValidationPipe } from '../../common/pipes/image-upload-validation.pipe';
import { UploadImageQueryDto } from './dto/upload-image-query.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload an image to DigitalOcean Spaces' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file. Allowed: jpg, jpeg, png, webp. Max 5MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  uploadImage(
    @UploadedFile(ImageUploadValidationPipe) file: Express.Multer.File,
    @Query() query: UploadImageQueryDto,
  ) {
    return this.uploadsService.uploadImage(file, query.folder ?? 'products');
  }
}

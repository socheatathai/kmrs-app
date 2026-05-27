import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { ImageUploadValidationPipe } from '../../common/pipes/image-upload-validation.pipe';
import { ImagesUploadValidationPipe } from '../../common/pipes/images-upload-validation.pipe';
import { ImageKeyQueryDto } from './dto/image-key-query.dto';
import { RemoveImageResponseDto } from './dto/remove-image-response.dto';
import { UploadImageQueryDto } from './dto/upload-image-query.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('images')
  @ApiOperation({ summary: 'Get an uploaded image by key' })
  @ApiOkResponse({ type: UploadImageResponseDto })
  getImage(@Query() query: ImageKeyQueryDto) {
    return this.uploadsService.getImage(query.key);
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload one image to DigitalOcean Spaces' })
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

  @Post('images/multiple')
  @ApiOperation({ summary: 'Upload multiple images to DigitalOcean Spaces' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Image files. Allowed: jpg, jpeg, png, webp. Max 5MB each, up to 10 files.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadImageResponseDto, isArray: true })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  uploadImages(
    @UploadedFiles(ImagesUploadValidationPipe) files: Express.Multer.File[],
    @Query() query: UploadImageQueryDto,
  ) {
    return this.uploadsService.uploadImages(files, query.folder ?? 'products');
  }

  @Delete('images')
  @ApiOperation({ summary: 'Remove an uploaded image by key' })
  @ApiOkResponse({ type: RemoveImageResponseDto })
  removeImage(@Query() query: ImageKeyQueryDto) {
    return this.uploadsService.removeImage(query.key);
  }
}

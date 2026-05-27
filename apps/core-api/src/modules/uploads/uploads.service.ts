import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import type { UploadFolder } from './dto/upload-image-query.dto';

type SpacesConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
};

export const SPACES_CLIENT = Symbol('SPACES_CLIENT');

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly spacesConfig: SpacesConfig;

  constructor(
    @Inject(SPACES_CLIENT) private readonly s3Client: S3Client,
    configService: ConfigService,
  ) {
    this.spacesConfig = this.readSpacesConfig(configService);
  }

  async uploadImage(file: Express.Multer.File, folder: UploadFolder) {
    const key = this.buildObjectKey(file, folder);
    await this.putImage(key, file);

    return this.buildImageResponse(key);
  }

  async uploadImages(files: Express.Multer.File[], folder: UploadFolder) {
    return Promise.all(
      files.map(async (file) => {
        const key = this.buildObjectKey(file, folder);
        await this.putImage(key, file);

        return this.buildImageResponse(key);
      }),
    );
  }

  async getImage(key: string) {
    await this.assertImageExists(key);

    return this.buildImageResponse(key);
  }

  async removeImage(key: string) {
    await this.assertImageExists(key);

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.spacesConfig.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove image from Spaces key=${key}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      if (error instanceof S3ServiceException) {
        throw new BadGatewayException(`Storage delete failed: ${error.name}`);
      }

      throw new InternalServerErrorException('Unable to remove image');
    }

    return {
      key,
      deleted: true,
    };
  }

  private async putImage(key: string, file: Express.Multer.File) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.spacesConfig.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
          ACL: 'public-read',
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload image to Spaces key=${key}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      if (error instanceof S3ServiceException) {
        throw new BadGatewayException(`Storage upload failed: ${error.name}`);
      }

      throw new InternalServerErrorException('Unable to upload image');
    }
  }

  private async assertImageExists(key: string) {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.spacesConfig.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      if (
        error instanceof S3ServiceException &&
        (error.name === 'NotFound' ||
          error.name === 'NoSuchKey' ||
          error.$metadata.httpStatusCode === 404)
      ) {
        throw new NotFoundException(`Image not found for key: ${key}`);
      }

      this.logger.error(
        `Failed to read image from Spaces key=${key}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      if (error instanceof S3ServiceException) {
        throw new BadGatewayException(`Storage read failed: ${error.name}`);
      }

      throw new InternalServerErrorException('Unable to read image');
    }
  }

  private buildImageResponse(key: string) {
    return {
      url: `${this.spacesConfig.publicUrl.replace(/\/+$/, '')}/${key}`,
      key,
    };
  }

  private buildObjectKey(file: Express.Multer.File, folder: UploadFolder) {
    const safeBaseName = this.slugifyFilename(file.originalname);
    const extension = this.resolveExtension(file);

    return `${folder}/${safeBaseName}-${randomUUID()}.${extension}`;
  }

  private resolveExtension(file: Express.Multer.File) {
    const mimeExtension = EXTENSION_BY_MIME_TYPE[file.mimetype];

    if (mimeExtension) {
      return mimeExtension;
    }

    return extname(file.originalname).replace('.', '').toLowerCase();
  }

  private slugifyFilename(originalName: string) {
    const withoutExtension = originalName.replace(/\.[^.]+$/, '');
    const slug = withoutExtension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    return slug || 'image';
  }

  private readSpacesConfig(configService: ConfigService): SpacesConfig {
    const config: SpacesConfig = {
      endpoint: configService.get<string>('spaces.endpoint') ?? '',
      region: configService.get<string>('spaces.region') ?? '',
      bucket: configService.get<string>('spaces.bucket') ?? '',
      accessKeyId: configService.get<string>('spaces.accessKeyId') ?? '',
      secretAccessKey:
        configService.get<string>('spaces.secretAccessKey') ?? '',
      publicUrl: configService.get<string>('spaces.publicUrl') ?? '',
    };

    const missingKeys = Object.entries(config)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      throw new Error(
        `DigitalOcean Spaces configuration is incomplete: ${missingKeys.join(', ')}`,
      );
    }

    return config;
  }
}

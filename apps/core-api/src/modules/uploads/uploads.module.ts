import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

import { UploadsController } from './uploads.controller';
import { SPACES_CLIENT, UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    {
      provide: SPACES_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new S3Client({
          endpoint: configService.get<string>('spaces.endpoint'),
          region: configService.get<string>('spaces.region'),
          credentials: {
            accessKeyId: configService.get<string>('spaces.accessKeyId') ?? '',
            secretAccessKey:
              configService.get<string>('spaces.secretAccessKey') ?? '',
          },
        }),
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}

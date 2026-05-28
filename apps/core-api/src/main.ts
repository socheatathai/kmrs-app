import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const corsOriginsValue = configService.get<string>('CORS_ORIGINS');
  const corsOrigins =
    corsOriginsValue
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  const port = configService.get<number>('PORT') ?? 3000;

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.enableCors({
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
  });

  const logger = new Logger('Bootstrap');

  const config = new DocumentBuilder()
    .setTitle('KMRS API')
    .setDescription('KMRS digital menu API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  logger.log(`Server is running on http://localhost:${port}/docs`);
}

void bootstrap();

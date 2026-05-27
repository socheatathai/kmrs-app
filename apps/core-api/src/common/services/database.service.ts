import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly requestContext: RequestContextService) {}

  async execute<T>(operation: string, handler: () => Promise<T>): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      this.mapError(operation, error);
    }
  }

  private mapError(operation: string, error: unknown): never {
    if (error instanceof HttpException) {
      throw error;
    }

    const requestId = this.requestContext.getRequestId() ?? 'no-request-id';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.warn(
        `Prisma error in ${operation} (${requestId}): ${error.code}`,
      );

      switch (error.code) {
        case 'P2002':
          throw new ConflictException('Resource already exists');
        case 'P2025':
          throw new NotFoundException('Resource not found');
      }
    }

    this.logger.error(
      `Unhandled database error in ${operation} (${requestId})`,
      error instanceof Error ? error.stack : JSON.stringify(error),
    );
    throw new InternalServerErrorException('Database operation failed');
  }
}

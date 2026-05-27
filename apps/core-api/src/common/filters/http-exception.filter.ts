import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { RequestContextService } from '../context/request-context.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly requestContext: RequestContextService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = this.requestContext.getRequestId();

    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const errorPayload =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown> | null);

    const body = {
      success: false,
      error: {
        statusCode,
        code:
          errorPayload?.error ??
          (exception instanceof Error ? exception.name : 'Error'),
        message:
          errorPayload?.message ??
          (exception instanceof Error
            ? exception.message
            : 'Internal server error'),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId,
      },
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} failed (${requestId ?? 'no-request-id'})`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    }

    response.status(statusCode).json(body);
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { RequestContextService } from '../context/request-context.service';
import type { AuthUser } from '../types/auth-user.type';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestMetricsInterceptor.name);

  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: AuthUser }>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const requestId = this.requestContext.getRequestId() ?? 'no-request-id';
    const userId = request.user?.sub ?? 'anonymous';
    const ip = request.ip ?? 'unknown-ip';

    this.logger.log(
      `incoming ${request.method} ${request.url} user=${userId} ip=${ip} requestId=${requestId}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `completed ${request.method} ${request.url} status=${response.statusCode} durationMs=${Date.now() - startedAt} user=${userId} requestId=${requestId}`,
          );
        },
        error: () => {
          this.logger.warn(
            `failed ${request.method} ${request.url} status=${response.statusCode} durationMs=${Date.now() - startedAt} user=${userId} requestId=${requestId}`,
          );
        },
      }),
    );
  }
}

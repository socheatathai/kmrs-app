import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import type { AuthUser } from '../types/auth-user.type';
import { AuditLogService } from '../services/audit-log.service';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly requestContext: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: AuthUser }>();
    const response = http.getResponse<Response>();

    if (!this.shouldAudit(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.auditLogService.recordFromHttp(request, response.statusCode, {
            requestId: this.requestContext.getRequestId(),
          });
        },
        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException ? error.getStatus() : 500;
          this.auditLogService.recordFromHttp(request, statusCode, {
            requestId: this.requestContext.getRequestId(),
            error:
              error instanceof Error
                ? error.message
                : 'Unhandled exception during request',
          });
        },
      }),
    );
  }

  private shouldAudit(method: string) {
    return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase());
  }
}

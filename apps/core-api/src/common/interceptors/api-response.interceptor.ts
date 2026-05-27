import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (this.isWrappedResponse(data)) {
          return data;
        }

        return {
          success: true,
          data,
          meta: {
            requestId: this.requestContext.getRequestId(),
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }

  private isWrappedResponse(
    value: unknown,
  ): value is { success: boolean; data?: unknown } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      typeof (value as { success: unknown }).success === 'boolean'
    );
  }
}

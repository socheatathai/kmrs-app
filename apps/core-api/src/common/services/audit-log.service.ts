import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

import type { AuthUser } from '../types/auth-user.type';
import { PrismaService } from '../../database/prisma/prisma.service';

type AuditContext = {
  requestId?: string;
  error?: string;
};

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  recordFromHttp(
    request: Request & { user?: AuthUser },
    statusCode: number,
    context: AuditContext,
  ) {
    const { action, entity, entityId } = this.deriveAction(request);
    const user = request.user;

    void this.prisma.auditLog
      .create({
        data: {
          userId: user?.sub,
          action,
          entity,
          entityId,
          method: request.method,
          path: request.originalUrl || request.url,
          statusCode,
          requestId: context.requestId,
          ip: request.ip,
          userAgent: this.normalizeHeader(request.headers['user-agent']),
          metadata: {
            params: request.params,
            query: request.query,
            body: this.sanitizeBody(request.body),
            role: user?.role,
            error: context.error,
          } as Prisma.InputJsonValue,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Failed to persist audit log for ${request.method} ${request.url}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      });
  }

  private deriveAction(request: Request) {
    const segments = (request.route?.path || request.path)
      .split('/')
      .filter(Boolean)
      .filter((segment) => !segment.startsWith(':'));
    const primaryEntity = segments[0] ?? null;
    const action = `${request.method.toUpperCase()}_${primaryEntity ?? 'unknown'}`;
    const entityId =
      request.params.shopId ??
      request.params.productId ??
      request.params.categoryId ??
      request.params.subscriptionId ??
      request.params.qrCodeId ??
      null;

    return {
      action,
      entity: primaryEntity,
      entityId: Array.isArray(entityId) ? entityId[0] : entityId,
    };
  }

  private sanitizeBody(body: unknown): Prisma.InputJsonValue | null {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return (body as Prisma.InputJsonValue | null) ?? null;
    }

    const clone = { ...(body as Record<string, unknown>) };
    delete clone.password;
    delete clone.refreshToken;

    return clone as Prisma.InputJsonValue;
  }

  private normalizeHeader(header: string | string[] | undefined) {
    if (Array.isArray(header)) {
      return header[0];
    }

    return header;
  }
}

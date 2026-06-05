import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId?: string;
    action: string;
    entity: string | null;
    entityId: string | null;
    method: string;
    path: string;
    statusCode: number;
    requestId?: string;
    ip?: string;
    userAgent?: string;
    metadata: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  findRecent(query: { action?: string; entity?: string; userId?: string }) {
    return this.prisma.auditLog.findMany({
      where: {
        action: query.action,
        entity: query.entity,
        userId: query.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

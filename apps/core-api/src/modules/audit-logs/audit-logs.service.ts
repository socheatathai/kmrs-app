import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
  ) {}

  findRecent(query: ListAuditLogsDto) {
    return this.database.execute('auditLogs.findRecent', () =>
      this.prisma.auditLog.findMany({
        where: {
          action: query.action,
          entity: query.entity,
          userId: query.userId,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    );
  }
}

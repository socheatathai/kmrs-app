import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/services/database.service';
import { AuditLogsRepository } from '../../database/repositories';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly auditLogsRepository: AuditLogsRepository,
  ) {}

  findRecent(query: ListAuditLogsDto) {
    return this.database.execute('auditLogs.findRecent', () =>
      this.auditLogsRepository.findRecent(query),
    );
  }
}

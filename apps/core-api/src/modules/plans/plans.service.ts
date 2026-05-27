import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/services/database.service';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly database: DatabaseService,
  ) {}

  findAll() {
    return this.database.execute('plans.findAll', () =>
      this.prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      }),
    );
  }
}

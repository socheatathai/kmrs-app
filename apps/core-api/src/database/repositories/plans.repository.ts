import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActivePlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  findActivePlanById(id: string) {
    return this.prisma.plan.findFirst({
      where: {
        id,
        isActive: true,
      },
    });
  }
}

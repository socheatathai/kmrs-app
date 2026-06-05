import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/services/database.service';
import { PlansRepository } from '../../database/repositories';

@Injectable()
export class PlansService {
  constructor(
    private readonly database: DatabaseService,
    private readonly plansRepository: PlansRepository,
  ) {}

  findAll() {
    return this.database.execute('plans.findAll', () =>
      this.plansRepository.findActivePlans(),
    );
  }
}

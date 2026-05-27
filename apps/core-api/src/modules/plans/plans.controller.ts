import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Public()
  @ApiOperation({ summary: 'List active subscription plans' })
  @ApiOkResponse({ description: 'Available plans' })
  @Get()
  findAll() {
    return this.plansService.findAll();
  }
}

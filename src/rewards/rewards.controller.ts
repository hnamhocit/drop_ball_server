import { Controller, Get, Query } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getRewards(@Query() query: PaginationDto) {
    return this.rewardsService.getRewards(query);
  }
}

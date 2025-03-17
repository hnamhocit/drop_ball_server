import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateRewardDTO } from './dtos/update-reward.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getRewards(@Query() query: PaginationDto) {
    return this.rewardsService.getRewards(query);
  }

  @Patch(':id')
  updateReward(@Body() data: UpdateRewardDTO, @Param('id') id: string) {
    return this.rewardsService.updateReward(Number(id), data);
  }
}

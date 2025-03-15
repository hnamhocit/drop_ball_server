import { Body, Controller, Get, Param, Patch } from '@nestjs/common'

import { UpdateRewardDTO } from './dtos/update-reward.dto'
import { RewardsService } from './rewards.service'

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  getRewards() {
    return this.rewardsService.getRewards();
  }

  @Patch(':id')
  updateReward(@Body() data: UpdateRewardDTO, @Param('id') id: string) {
    return this.rewardsService.updateReward(Number(id), data);
  }
}

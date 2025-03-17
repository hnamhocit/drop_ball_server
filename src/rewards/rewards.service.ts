import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateRewardDTO } from './dtos/update-reward.dto';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateReward(id: number, data: UpdateRewardDTO) {
    try {
      const existingReward = await this.prisma.reward.findUnique({
        where: { id },
      });

      if (!existingReward) {
        return { code: 0, msg: 'Reward not found!' };
      }

      const updatedReward = await this.prisma.reward.update({
        where: { id },
        data,
      });

      return { code: 1, data: updatedReward };
    } catch (error) {
      return { code: 1, msg: 'Update reward error: ' + JSON.stringify(error) };
    }
  }

  async getRewards() {
    try {
      const rewards = await this.prisma.reward.findMany();
      return { code: 1, data: rewards };
    } catch (error) {
      return { code: 1, msg: 'Get rewards error: ' + JSON.stringify(error) };
    }
  }
}

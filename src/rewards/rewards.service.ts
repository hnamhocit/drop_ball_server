import { Injectable } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
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

  async getRewards({ page, pageSize }: PaginationDto) {
    try {
      const [rewards, totalRecords] = await Promise.all([
        this.prisma.reward.findMany({
          include: { gift: true, giftCodes: true },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.reward.count(),
      ]);

      const totalPages = Math.ceil(totalRecords / pageSize);

      return {
        code: 1,
        msg: 'Success',
        data: {
          rewards,
          pagination: {
            currentPage: page,
            pageSize: pageSize,
            totalPages: totalPages,
          },
        },
      };
    } catch (error) {
      return { code: 1, msg: 'Get rewards error: ' + JSON.stringify(error) };
    }
  }
}

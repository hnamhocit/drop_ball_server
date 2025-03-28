import { Injectable } from '@nestjs/common';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRewards({ page, pageSize }: PaginationDto) {
    try {
      const [rewards, totalRecords] = await Promise.all([
        this.prisma.reward.findMany({
          include: { gift: true },
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

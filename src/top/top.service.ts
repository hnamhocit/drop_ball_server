import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopScores(count: number) {
    try {
      const topScores = await this.prisma.user.findMany({
        where: {
          score: {
            gt: 0,
          },
        },
        orderBy: { score: 'desc' },
        take: count,
      });

      return { code: 1, msg: 'Success', data: topScores };
    } catch (error) {
      return { code: 0, msg: 'Get top scores error: ' + JSON.stringify(error) };
    }
  }
}

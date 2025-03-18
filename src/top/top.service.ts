import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TopService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopUsers(n: number) {
    try {
      const topScores = await this.prisma.user.findMany({
        orderBy: { score: 'desc' },
        take: n,
      });

      return { code: 1, msg: 'Success', data: topScores };
    } catch (error) {
      return { code: 0, msg: 'Get n tops error: ' + JSON.stringify(error) };
    }
  }
}

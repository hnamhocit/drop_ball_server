import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { UpdateScoreDTO } from './dtos/update-score.dto'

@Injectable()
export class PlayService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUserScore(data: UpdateScoreDTO, uin: string) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { uin },
        data: data,
      });

      return {
        code: 1,
        msg: 'Success',
        data: {
          score: updatedUser.score,
        },
      };
    } catch (error) {
      return {
        code: 0,
        msg: 'Update user score error: ' + JSON.stringify(error),
      };
    }
  }
}

import { PrismaService } from 'src/prisma/prisma.service';

import { Injectable } from '@nestjs/common';

@Injectable()
export class WishesService {
  constructor(private readonly prisma: PrismaService) {}

  async createWish(uin: string, userUin: string) {
    try {
      const existingWish = await this.prisma.wish.findFirst({
        where: { userUin },
      });

      if (!existingWish) {
        await this.prisma.user.update({
          where: {
            uin,
          },
          data: {
            ballCount: { increment: 5 },
          },
        });
      }

      const newWish = await this.prisma.wish.create({
        data: {
          user: {
            connect: { uin: userUin },
          },
        },
      });

      return { code: 1, msg: 'Success!', data: newWish };
    } catch (error) {
      return { code: 0, msg: 'Create wish error: ' + JSON.stringify(error) };
    }
  }
}

import { PrismaService } from 'src/prisma/prisma.service';

import { Injectable } from '@nestjs/common';

import { CreateWithDTO } from './dtos/create-wish.dto';

@Injectable()
export class WishesService {
  constructor(private readonly prisma: PrismaService) {}

  async createWish(uin: string, data: CreateWithDTO) {
    try {
      const existingWish = await this.prisma.wish.findFirst({
        where: { userUin: data.userUin },
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
          message: data.message,
          user: {
            connect: { uin: data.userUin },
          },
        },
      });

      return { code: 1, msg: 'Success!', data: newWish };
    } catch (error) {
      return { code: 0, msg: 'Create wish error: ' + JSON.stringify(error) };
    }
  }
}

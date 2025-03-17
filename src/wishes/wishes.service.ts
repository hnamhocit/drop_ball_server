import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { CreateWithDTO } from './dtos/create-wish.dto'

@Injectable()
export class WishesService {
  constructor(private readonly prisma: PrismaService) {}

  async createWish(uin: string, data: CreateWithDTO) {
    try {
      const existingWish = await this.prisma.wish.findFirst({
        where: { userUin: uin },
      });

      if (existingWish) {
        return {
          code: 0,
          msg: 'Wish already exists!',
        };
      }

      const newWish = await this.prisma.wish.create({
        data: {
          message: data.message,
          user: {
            connect: { uin },
          },
        },
      });

      await this.prisma.user.update({
        where: { uin },
        data: {
          ballCount: { increment: 5 },
        },
      });

      return { code: 1, msg: 'Success!', data: newWish };
    } catch (error) {
      return { code: 0, msg: 'Create wish error: ' + JSON.stringify(error) };
    }
  }

  async getWishes() {
    try {
      const wishes = await this.prisma.wish.findMany();
      return { code: 1, data: wishes };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get wishes error: ' + JSON.stringify(error),
      };
    }
  }
}

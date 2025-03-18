import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserDTO } from './dtos/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(uin: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { uin },
        include: { wish: true },
      });

      return { code: 1, msg: 'Success', data: user };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get user error: ' + JSON.stringify(error),
        data: null,
      };
    }
  }

  async updateUser(data: UpdateUserDTO, uin: string) {
    try {
      const user = await this.prisma.user.update({
        where: { uin },
        data: data,
      });

      return { code: 1, msg: 'Success', data: user };
    } catch (error) {
      return {
        code: 0,
        msg: 'Update user error: ' + JSON.stringify(error),
        data: null,
      };
    }
  }

  async getUserRewards(uin: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { uin },
        include: { rewards: { include: { gift: true, giftCodes: true } } },
      });

      return {
        code: 1,
        msg: 'Success',
        data: {
          rewards: user?.rewards,
        },
      };
    } catch (error) {
      return {
        code: 0,
        msg: 'Get user rewards error: ' + JSON.stringify(error),
      };
    }
  }
}

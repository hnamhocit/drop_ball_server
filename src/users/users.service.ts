import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDTO } from './dtos/update-user.dto';

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
        include: {
          rewards: {
            select: {
              count: true,
              createdAt: true,
              giftCodes: true,
              gift: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const results: { type: number; value: number; giftList?: string[] }[] = [
        {
          type: 1,
          value: 0,
        },
        {
          type: 2,
          value: 0,
        },
        {
          type: 3,
          value: 0,
        },
        {
          type: 4,
          value: 0,
          giftList: [],
        },
      ];

      const getRewardType = (name: string | undefined) => {
        if (name === 'Figure premium Mini World') return 1;
        if (name === 'Skin VVIP') return 2;
        if (name === 'Quà tặng hiện vật bí mật') return 3;
        return 4;
      };

      user?.rewards.forEach((reward) => {
        const type = getRewardType(reward.gift?.name);
        const index = type - 1;
        const giftCodes = reward.giftCodes as string[];

        if (type === 4 && giftCodes.length > 0) {
          results[type - 1].giftList = [
            ...(results[type - 1].giftList as string[]),
            ...giftCodes,
          ];
        }

        results[index].value += reward.count;
      });

      return {
        code: 1,
        msg: 'Success',
        data: {
          rewards: results,
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

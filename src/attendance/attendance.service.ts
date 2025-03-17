import { getRandomGiftCode } from 'src/common/utils/gift-code'

import { Injectable } from '@nestjs/common'

import { randomNumber } from '../common/utils/randomNumber'
import { weightedRandomSelector } from '../common/utils/weightedRandomSelector'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(uin: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.prisma.user.findUnique({
      where: { uin },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const lastCheckIn = user.lastCheckIn?.setHours
      ? new Date(user.lastCheckIn).setHours(0, 0, 0, 0)
      : null;

    if (lastCheckIn === today.getTime()) {
      return {
        message: 'You have already checked in today.',
        count: user.checkInCount,
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { uin },
      data: {
        checkInCount: { increment: 1 },
        lastCheckIn: new Date(),
        dailyRewardClaimed: true,
      },
    });

    const ballCount = randomNumber(20, 1);
    const results: {
      type: number;
      name: string;
      value: number | string;
    }[] = [
      {
        type: 5,
        name: 'Ball',
        value: ballCount,
      },
    ];

    const weights = { 1: 30, 2: 70 };
    const randomKey = weightedRandomSelector(weights);
    const giftCodes = await this.prisma.giftCode.findMany({
      where: { remainingCount: { gt: 0 } },
    });

    if (randomKey === 1) {
      const giftCode = getRandomGiftCode(giftCodes, uin);
      results.push({
        type: 4,
        name: 'GIFT CODE',
        value: giftCode?.code as string,
      });
    }

    return {
      code: 1,
      msg: 'Check-in successful!',
      data: results,
    };
  }

  async resetDailyCheckIn(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.user.updateMany({
      data: {
        dailyRewardClaimed: false,
      },
    });

    console.log(`Daily check-in reset completed on ${today.toISOString()}`);
  }
}

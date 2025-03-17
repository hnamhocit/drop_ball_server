import { Injectable } from '@nestjs/common';

import { randomNumber } from '../common/utils/randomNumber';
import { weightedRandomSelector } from '../common/utils/weightedRandomSelector';
import { PrismaService } from '../prisma/prisma.service';

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

    await this.prisma.user.update({
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

    const weights = new Map([
      [1, 30],
      [2, 70],
    ]);
    const randomKey = weightedRandomSelector(weights);
    const giftCodes = await this.prisma.giftCode.findMany({
      where: { users: { none: { uin } } },
    });

    if (randomKey === 1 && giftCodes.length > 0) {
      const randomIndex = Math.floor(Math.random() * giftCodes.length);
      const code = giftCodes[randomIndex].code;

      results.push({
        type: 4,
        name: 'GIFT CODE',
        value: code,
      });

      await this.prisma.giftCode.update({
        where: { code },
        data: { users: { connect: { uin } } },
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

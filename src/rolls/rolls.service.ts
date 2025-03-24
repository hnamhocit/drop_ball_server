import { Injectable, OnModuleInit } from '@nestjs/common';
import { Gift } from '@prisma/client';

import { randomNumber } from '../common/utils/randomNumber';
import { getGiftByIndex } from '../common/utils/reward';
import weightedRandom from '../common/utils/weightedRandom';
import { PrismaService } from '../prisma/prisma.service';
import { RandomDTO } from './dtos/random.dto';

@Injectable()
export class RollsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const success = await this.initGiftsAndGiftCodes();

      if (!success) {
        return { code: 0, msg: 'Init gifts and giftcodes error!' };
      }
    } catch (error) {
      return {
        code: 0,
        msg: 'Init gifts and giftcodes error: ' + JSON.stringify(error),
      };
    }
  }

  async random(uin: string, data: RandomDTO) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { uin },
      });

      if (!user) {
        return {
          code: 0,
          msg: 'User not found!',
        };
      }

      if (user.ballCount <= 0) {
        return { code: 0, msg: 'Insufficient ball count' };
      }

      await this.prisma.user.update({
        where: { uin },
        data: { ballCount: { decrement: data.gate.length } },
      });

      const isValidGate = data.gate.every(
        (gateValue) => gateValue >= 1 && gateValue <= 6,
      );

      if (!isValidGate) {
        return {
          code: 0,
          msg: 'Invalid gate values! Gate values must be between 1 and 6.',
        };
      }

      const results = new Map<number, number | string[]>([
        [1, 0],
        [2, 0],
        [3, 0],
        [4, []],
        [5, 0],
      ]);

      const gifts = await this.prisma.gift.findMany();

      if (!gifts) {
        return { code: 0, msg: 'Get gifts error!' };
      }

      const giftCodes = await this.prisma.giftCode.findMany({
        where: {
          users: {
            none: {
              uin,
            },
          },
        },
      });

      if (!giftCodes) {
        return {
          code: 0,
          msg: 'Get gift codes error!',
        };
      }

      for (const i of data.gate) {
        if (i === 6) break;

        const weights = new Map<number, number>();
        let totalHitRatio = 0;
        for (let j = i; j < 6; j++) {
          weights.set(j, data.ratios[j - 1]);
          totalHitRatio += data.ratios[j - 1];
        }

        const missRatio = 100 - totalHitRatio;
        weights.set(6, missRatio);

        const selectedGate = weightedRandom(weights);

        switch (selectedGate) {
          case 1:
          case 2:
          case 3:
            results.set(
              selectedGate,
              (results.get(selectedGate) as number) + 1,
            );
            break;

          case 4:
            const giftCodeArray = (results.get(4) as string[]) || [];
            const existingCodes = new Set(giftCodeArray);

            if (existingCodes.size === giftCodes.length) {
              return;
            }

            let newCode: string;
            do {
              const randomIndex = Math.floor(Math.random() * giftCodes.length);
              newCode = giftCodes[randomIndex].code;
            } while (existingCodes.has(newCode));

            await this.prisma.giftCode.update({
              where: { code: newCode },
              data: {
                users: { connect: { uin } },
              },
            });

            existingCodes.add(newCode);
            results.set(4, Array.from(existingCodes));
            break;

          case 5:
            const ballCount = randomNumber(2, 0);

            await this.prisma.user.update({
              where: { uin },
              data: { ballCount: { increment: ballCount } },
            });

            results.set(5, (results.get(5) as number) + ballCount);
            break;

          default:
            break;
        }
      }

      try {
        await this.createReward(results, gifts, user.uin);
      } catch (err) {
        return { code: 0, msg: `Create reward error: ${err.message}` };
      }

      return {
        code: 1,
        msg: 'Get random gift successfully!',
        data: Object.fromEntries(results),
      };
    } catch (error) {
      console.error(error);
      return { code: 0, msg: 'Internal server error' };
    }
  }

  private async createReward(
    results: Map<number, number | string[]>,
    gifts: Gift[],
    uin: string,
  ) {
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const [key, value] of results) {
          switch (key) {
            case 1:
            case 2:
            case 3: {
              const giftIndex = key;
              const _value = value as number;

              let remaining = _value;

              for (let i = giftIndex; i <= 3; i++) {
                const gift = getGiftByIndex(gifts, i);

                if (!gift || remaining <= 0) continue;

                const giftRewardCount = await tx.reward.aggregate({
                  where: { userUin: uin, giftId: gift.id },
                  _sum: { count: true },
                });

                const currentRewardCount = giftRewardCount._sum.count || 0;

                const allocatedCount = Math.min(
                  remaining,
                  gift.maxCount - currentRewardCount,
                );

                if (allocatedCount > 0) {
                  await tx.reward.create({
                    data: {
                      giftId: gift.id,
                      count: allocatedCount,
                      userUin: uin,
                    },
                  });
                }

                remaining -= allocatedCount;
              }

              break;
            }

            case 4: {
              const giftCodeSlice = (value as string[]).map((code) => ({
                code,
              }));

              if (giftCodeSlice.length > 0) {
                try {
                  await tx.reward.create({
                    data: {
                      userUin: uin,
                      count: giftCodeSlice.length,
                      giftCodes: {
                        connect: giftCodeSlice,
                      },
                    },
                  });
                } catch (err) {
                  console.error(err.message);
                  throw new Error(`Failed to create reward: ${err.message}`);
                }
              }

              break;
            }

            default:
              break;
          }
        }
      });

      return null;
    } catch (err) {
      throw new Error(`Error creating rewards: ${err.message}`);
    }
  }

  private async initGiftsAndGiftCodes() {
    try {
      const giftsCount = await this.prisma.gift.count();
      // const giftCodesCount = await this.prisma.giftCode.count();

      // if (giftCodesCount === 0) {
      //   const giftCodes = Array.from({ length: 200 }, (_, i) => ({
      //     code: `GIFTCODE${i + 1}`,
      //     usedByUins: [],
      //   }));

      //   await this.prisma.giftCode.createMany({
      //     data: giftCodes,
      //     skipDuplicates: true,
      //   });
      // }

      if (giftsCount === 0) {
        await this.prisma.gift.createMany({
          data: [
            { name: 'Figure premium Mini World', maxCount: 3, index: 1 },
            { name: 'Skin VVIP', maxCount: 10, index: 2 },
            { name: 'Quà tặng hiện vật bí mật', maxCount: 10, index: 3 },
          ],
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}

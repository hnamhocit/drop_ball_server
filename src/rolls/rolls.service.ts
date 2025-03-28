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
      const user = await this.prisma.user.findUnique({ where: { uin } });
      if (!user) return { code: 0, msg: 'User not found!' };

      if (user.ballCount < data.gate.length) {
        return { code: 0, msg: 'Insufficient ball count' };
      }

      await this.prisma.user.update({
        where: { uin },
        data: { ballCount: { decrement: data.gate.length } },
      });

      if (!data.gate.every((gateValue) => gateValue >= 1 && gateValue <= 6)) {
        return {
          code: 0,
          msg: 'Invalid gate values! Gate values must be between 1 and 6.',
        };
      }

      const results = new Map<number, number | string[]>([
        [1, 0], // Index 1
        [2, 0], // Index 2
        [3, 0], // Index 3
        [4, []], // Mã quà tặng
        [5, 0], // Số bóng thưởng
      ]);

      const gifts = await this.prisma.gift.findMany();

      if (!gifts || !gifts.length) {
        return { code: 0, msg: 'Error fetching gifts!' };
      }

      for (const i of data.gate) {
        if (i === 6) break;

        const weights = new Map<number, number>();
        let totalHitRatio = 0;
        for (let j = i; j < 6; j++) {
          weights.set(j, data.ratios[j - 1]);
          totalHitRatio += data.ratios[j - 1];
        }
        weights.set(6, 100 - totalHitRatio);

        const selectedGate = weightedRandom(weights);

        switch (selectedGate) {
          case 1:
          case 2:
          case 3:
            const gift = await this.prisma.gift.findFirst({
              where: {
                index: selectedGate,
              },
            });

            const existingReward = await this.prisma.reward.findFirst({
              where: { userUin: uin, gift: { index: selectedGate } },
            });

            if (gift && gift.maxCount === 0) continue;

            if (results.get(selectedGate) === 0 && !existingReward) {
              results.set(selectedGate, 1);
            }

            break;

          case 4:
            const giftCode = await this.prisma.giftCode.findFirst();

            if (giftCode) {
              const existingCodes = new Set(results.get(4) as string[]);

              await this.prisma.giftCode.delete({
                where: {
                  code: giftCode.code,
                },
              });

              existingCodes.add(giftCode.code);
              results.set(4, Array.from(existingCodes));
            }

            break;

          case 5:
            results.set(5, (results.get(5) as number) + 1);
            break;

          default:
            break;
        }
      }

      // total increase ball count
      await this.prisma.user.update({
        where: { uin },
        data: { ballCount: { increment: results.get(5) as number } },
      });

      try {
        await this.createReward(results, gifts, uin);
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
      return {
        code: 0,
        msg: 'Internal server error: ' + JSON.stringify(error),
      };
    }
  }

  private async createReward(
    results: Map<number, number | string[]>,
    gifts: Gift[],
    uin: string,
  ) {
    try {
      for (const [key, value] of results) {
        switch (key) {
          case 1:
          case 2:
          case 3: {
            const _value = value as number;

            let remaining = _value;

            for (let i = key; i <= 3 && remaining > 0; i++) {
              const gift = getGiftByIndex(gifts, i);

              if (!gift) continue;

              const hasExistingReward = await this.prisma.reward.findFirst({
                where: { userUin: uin, giftId: gift.id },
              });

              if (hasExistingReward) continue;

              const _gift = await this.prisma.gift.findUnique({
                where: { id: gift.id },
              });

              if (!_gift) {
                return { code: 0, msg: 'Gift not found' };
              }

              if (_gift.maxCount <= 0) continue;

              if (_gift.maxCount > 0) {
                await this.prisma.gift.update({
                  where: {
                    id: gift.id,
                  },
                  data: {
                    maxCount: { decrement: 1 },
                  },
                });
              }

              await this.prisma.reward.create({
                data: {
                  giftId: gift.id,
                  count: 1,
                  userUin: uin,
                  giftCodes: [],
                },
              });

              remaining -= 1;
            }

            break;
          }

          case 4: {
            const giftCodeSlice = value as string[];

            if (giftCodeSlice.length > 0) {
              try {
                await this.prisma.reward.create({
                  data: {
                    userUin: uin,
                    count: giftCodeSlice.length,
                    giftCodes: giftCodeSlice,
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

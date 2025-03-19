import { Injectable } from '@nestjs/common';
import { Gift } from '@prisma/client';

import { randomNumber } from '../common/utils/randomNumber';
import { getGiftByIndex, getRewardCountByGiftId } from '../common/utils/reward';
import weightedRandom from '../common/utils/weightedRandom';
import { PrismaService } from '../prisma/prisma.service';
import { RandomDTO } from './dtos/random.dto';

@Injectable()
export class RollsService {
  constructor(private readonly prisma: PrismaService) {}

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

      const giftsCount = await this.prisma.gift.count();
      const giftCodesCount = await this.prisma.giftCode.count();

      if (giftCodesCount === 0) {
        const giftCodes = Array.from({ length: 200 }, (_, i) => ({
          code: `GIFTCODE${i + 1}`,
          usedByUins: [],
        }));

        await this.prisma.giftCode.createMany({
          data: giftCodes,
          skipDuplicates: true,
        });
      }

      if (giftsCount === 0) {
        await this.prisma.gift.createMany({
          data: [
            { name: 'Model', maxCount: 3, index: 1 },
            { name: 'Skin VIP', maxCount: 10, index: 2 },
            { name: 'Skin DIY', maxCount: 30, index: 3 },
          ],
        });
      }

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

        const totalRatios = data.ratios.reduce((acc, ratio) => acc + ratio, 0);
        const weights = new Map<number, number>();
        for (let j = i; j < 6; j++) {
          weights.set(j, data.ratios[j - 1]);
        }
        weights.set(6, totalRatios);

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
      const rewards = await this.prisma.reward.findMany({
        where: { userUin: uin },
      });

      for (const [key, value] of results) {
        switch (key) {
          case 1:
            const gift1 = getGiftByIndex(gifts, 1);
            const _value = value as number;

            if (gift1 && _value > 0) {
              const gift1RewardCount = getRewardCountByGiftId(
                rewards,
                gift1.id,
              );

              const allocatedCount = Math.min(
                _value,
                gift1.maxCount - gift1RewardCount,
              );

              if (allocatedCount > 0) {
                await this.prisma.reward.create({
                  data: {
                    giftId: gift1.id,
                    count: allocatedCount,
                    userUin: uin,
                  },
                });
              }

              let remaining = _value - allocatedCount;
              if (remaining > 0) {
                const gift2 = getGiftByIndex(gifts, 2);

                if (gift2) {
                  const gift2RewardCount = getRewardCountByGiftId(
                    rewards,
                    gift2.id,
                  );

                  const allocatedCount = Math.min(
                    remaining,
                    gift2.maxCount - gift2RewardCount,
                  );

                  if (allocatedCount > 0) {
                    await this.prisma.reward.create({
                      data: {
                        giftId: gift2.id,
                        count: allocatedCount,
                        userUin: uin,
                      },
                    });
                  }

                  remaining -= allocatedCount;

                  if (remaining > 0) {
                    const gift3 = getGiftByIndex(gifts, 3);

                    if (gift3) {
                      const gift3RewardCount = getRewardCountByGiftId(
                        rewards,
                        gift3.id,
                      );

                      const allocatedCount = Math.min(
                        remaining,
                        gift3.maxCount - gift3RewardCount,
                      );

                      if (allocatedCount > 0) {
                        await this.prisma.reward.create({
                          data: {
                            giftId: gift3.id,
                            count: allocatedCount,
                            userUin: uin,
                          },
                        });
                      }
                    }
                  }
                }
              }
            }

            break;
          case 2:
            const gift2 = getGiftByIndex(gifts, 2);
            const _value2 = value as number;

            if (gift2 && _value2 > 0) {
              const gift2RewardCount = getRewardCountByGiftId(
                rewards,
                gift2.id,
              );

              const allocatedCount = Math.min(
                _value2,
                gift2.maxCount - gift2RewardCount,
              );

              if (allocatedCount > 0) {
                await this.prisma.reward.create({
                  data: {
                    giftId: gift2.id,
                    count: allocatedCount,
                    userUin: uin,
                  },
                });
              }

              const remaining = _value2 - allocatedCount;

              if (remaining > 0) {
                const gift3 = getGiftByIndex(gifts, 3);

                if (gift3) {
                  const gift3RewardCount = getRewardCountByGiftId(
                    rewards,
                    gift3.id,
                  );

                  const allocatedCount = Math.min(
                    remaining,
                    gift3.maxCount - gift3RewardCount,
                  );

                  if (allocatedCount > 0) {
                    await this.prisma.reward.create({
                      data: {
                        giftId: gift3.id,
                        count: allocatedCount,
                        userUin: uin,
                      },
                    });
                  }
                }
              }
            }

            break;
          case 3:
            const gift3 = getGiftByIndex(gifts, 3);
            const _value3 = value as number;

            if (gift3 && _value3 > 0) {
              const gift3RewardCount = getRewardCountByGiftId(
                rewards,
                gift3.id,
              );

              const allocatedCount = Math.min(
                _value3,
                gift3.maxCount - gift3RewardCount,
              );

              if (allocatedCount > 0) {
                await this.prisma.reward.create({
                  data: {
                    giftId: gift3.id,
                    count: allocatedCount,
                    userUin: uin,
                  },
                });
              }
            }

            break;

          case 4:
            const giftCodeSlice = (value as string[]).map((code) => ({
              code,
            }));

            if (giftCodeSlice.length > 0) {
              try {
                await this.prisma.reward.create({
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

          default:
            break;
        }
      }

      return null;
    } catch (err) {
      throw new Error(`Error creating rewards: ${err.message}`);
    }
  }
}

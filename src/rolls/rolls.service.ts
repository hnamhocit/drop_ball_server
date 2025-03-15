import { weightedRandomSelector } from 'src/common/utils/weightedRandomSelector';
import { PrismaService } from 'src/prisma/prisma.service';

import { Injectable } from '@nestjs/common';
import { Gift, Reward } from '@prisma/client';

import { RandomDTO } from './dtos/random.dto';

@Injectable()
export class RollsService {
  constructor(private readonly prisma: PrismaService) {}

  async random(uin: string, data: RandomDTO) {
    try {
      if (!uin) {
        return {
          code: 0,
          msg: 'UIN does not exist!',
        };
      }

      // Tìm người dùng trong cơ sở dữ liệu
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
        data: { ballCount: { decrement: 6 } },
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

      const results: { [key: number]: number | string[] } = {
        1: 0,
        2: 0,
        3: 0,
        4: [],
        5: 0,
      };

      const gate = data.gate;
      const gateLength = gate.length;

      const gifts = await this.prisma.gift.findMany();
      if (!gifts) {
        return { code: 0, msg: 'Get gifts error!' };
      }

      for (let i = 0; i < gateLength; i++) {
        if (i === 6) continue;

        const weights = {};
        for (let j = i; j < gateLength; j++) {
          if (j === 6) break;
          weights[j] = j === 1 ? 10 : 30;
        }

        const selectedGate = weightedRandomSelector(weights); // Hàm chọn ngẫu nhiên theo trọng số
        switch (selectedGate) {
          case 1:
          case 2:
          case 3:
            (results[selectedGate] as number)++;
            break;

          case 4:
            const giftCodes = await this.prisma.giftCode.findMany();
            if (!giftCodes || giftCodes.length === 0) {
              return {
                code: 0,
                msg: 'Get giftcodes error or length = 0!',
              };
            }

            const selectedGiftCodes = new Set();

            while (
              selectedGiftCodes.size <
              Math.min((results[4] as string[]).length, giftCodes.length)
            ) {
              const randomIndex = Math.floor(Math.random() * giftCodes.length);
              const randomGiftCode = giftCodes[randomIndex].code;

              if (!selectedGiftCodes.has(randomGiftCode)) {
                selectedGiftCodes.add(randomGiftCode);

                if (Array.isArray(results[4])) {
                  results[4].push(randomGiftCode);
                }
              }
            }
            break;

          case 5:
            const min = 2;
            const max = 6;
            const randomBallCount =
              Math.floor(Math.random() * (max - min + 1)) + min;

            await this.prisma.user.update({
              where: { uin },
              data: { ballCount: { increment: randomBallCount } },
            });
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

      return { code: 1, msg: 'Get random gift successfully!', data: results };
    } catch (error) {
      console.error(error);
      return { code: 0, msg: 'Internal server error' };
    }
  }

  private getGiftByIndex(gifts: Gift[], targetIndex: number) {
    return gifts.find((gift) => gift.index === targetIndex) || null;
  }

  private getRewardCountByGiftId(rewards: Reward[], giftId: number) {
    let count = 0;
    for (const reward of rewards) {
      if (reward.giftId === giftId && reward.count) {
        count += reward.count;
      }
    }
    return count;
  }

  async createReward(
    results: { [key: number]: number | string[] },
    gifts: Gift[],
    uin: string,
  ) {
    try {
      const rewards = await this.prisma.reward.findMany({
        where: { userUin: uin },
      });

      if (gifts.length == 0) {
        console.log('[GIFTS] is empty, create new...');
        /**
            Mô hình, số lượng 3
            Skin VIP, số lượng 10
            Skin DIY, số lượng 30
         */
        await this.prisma.gift.createMany({
          data: [
            {
              name: 'Figure',
              maxCount: 3,
              index: 1,
            },
            {
              name: 'Skin VIP',
              maxCount: 3,
              index: 10,
            },
            {
              name: 'Skin DIY',
              maxCount: 30,
              index: 3,
            },
          ],
        });
      }

      for (const key in results) {
        switch (parseInt(key)) {
          case 1:
            const gift1 = this.getGiftByIndex(gifts, 1);
            const value = results[key] as number;
            if (gift1 && value > 0) {
              const gift1RewardCount = this.getRewardCountByGiftId(
                rewards,
                gift1.id,
              );

              const allocatedCount = Math.min(
                value,
                gift1.maxCount - gift1RewardCount,
              );

              console.log('Case 1 gift 1 create');

              await this.prisma.reward.create({
                data: {
                  giftId: gift1.id,
                  count: allocatedCount,
                  userUin: uin,
                },
              });

              let remaining = value - allocatedCount;
              if (remaining > 0) {
                const gift2 = this.getGiftByIndex(gifts, 3);

                if (gift2) {
                  const gift2RewardCount = this.getRewardCountByGiftId(
                    rewards,
                    gift2.id,
                  );

                  const allocatedCount = Math.min(
                    remaining,
                    gift2.maxCount - gift2RewardCount,
                  );

                  console.log('Case 1 gift 2 create');

                  await this.prisma.reward.create({
                    data: {
                      giftId: gift2.id,
                      count: allocatedCount,
                      userUin: uin,
                    },
                  });

                  remaining -= allocatedCount;

                  if (remaining > 0) {
                    const gift3 = this.getGiftByIndex(gifts, 3);

                    if (gift3) {
                      const gift3RewardCount = this.getRewardCountByGiftId(
                        rewards,
                        gift3.id,
                      );

                      const allocatedCount = Math.min(
                        remaining,
                        gift3.maxCount - gift3RewardCount,
                      );

                      console.log('Case 1 gift 3 create');

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

            break;
          case 2:
            const gift2 = this.getGiftByIndex(gifts, 3);
            const value2 = results[key] as number;

            if (gift2 && value2 > 0) {
              const gift2RewardCount = this.getRewardCountByGiftId(
                rewards,
                gift2.id,
              );

              const allocatedCount = Math.min(
                value2,
                gift2.maxCount - gift2RewardCount,
              );

              console.log('Case 2 gift 2 create');

              await this.prisma.reward.create({
                data: {
                  giftId: gift2.id,
                  count: allocatedCount,
                  userUin: uin,
                },
              });

              const remaining = value2 - allocatedCount;

              if (remaining > 0) {
                const gift3 = this.getGiftByIndex(gifts, 3);

                if (gift3) {
                  const gift3RewardCount = this.getRewardCountByGiftId(
                    rewards,
                    gift3.id,
                  );

                  const allocatedCount = Math.min(
                    remaining,
                    gift3.maxCount - gift3RewardCount,
                  );

                  console.log('Case 2 gift 3 create');

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

            break;
          case 3:
            const gift3 = this.getGiftByIndex(gifts, 3);

            if (gift3 && (results[key] as number) > 0) {
              const gift3RewardCount = this.getRewardCountByGiftId(
                rewards,
                gift3.id,
              );

              const allocatedCount = Math.min(
                results[key] as number,
                gift3.maxCount - gift3RewardCount,
              );

              console.log('Case 3 gift 3 create');

              await this.prisma.reward.create({
                data: {
                  giftId: gift3.id,
                  count: allocatedCount,
                  userUin: uin,
                },
              });
            }

            break;

          case 4:
            const giftCodes = results[4];
            const giftCodeSlice = (giftCodes as string[]).map((code) => ({
              code,
            }));

            if (giftCodeSlice.length > 0) {
              try {
                console.log('Create reward gift code');

                await this.prisma.reward.create({
                  data: {
                    userUin: uin,
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

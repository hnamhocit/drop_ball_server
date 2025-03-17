import { Gift, Reward } from '@prisma/client';

function getGiftByIndex(gifts: Gift[], targetIndex: number) {
  return gifts.find((gift) => gift.index === targetIndex) || null;
}

function getRewardCountByGiftId(rewards: Reward[], giftId: number) {
  let count = 0;
  for (const reward of rewards) {
    if (reward.giftId === giftId && reward.count) {
      count += reward.count;
    }
  }
  return count;
}

export { getGiftByIndex, getRewardCountByGiftId };

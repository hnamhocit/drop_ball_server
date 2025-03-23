import { Gift, Reward } from '@prisma/client';

function getGiftByIndex(gifts: Gift[], targetIndex: number) {
  return gifts.find((gift) => gift.index === targetIndex) || null;
}

export { getGiftByIndex };

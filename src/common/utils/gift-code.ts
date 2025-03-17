import { GiftCode } from '@prisma/client'

export function getRandomGiftCode(availableGiftCodes: GiftCode[], uin: string) {
  if (availableGiftCodes.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableGiftCodes.length);
  const selectedGiftCode = availableGiftCodes[randomIndex];

  const userAlreadyHasGiftCode = (
    selectedGiftCode.usedByUins as string[]
  ).includes(uin);
  if (userAlreadyHasGiftCode) {
    return null;
  }

  return selectedGiftCode;
}

/*
  Warnings:

  - You are about to drop the column `rewardId` on the `GiftCode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `GiftCode` DROP FOREIGN KEY `GiftCode_rewardId_fkey`;

-- DropIndex
DROP INDEX `GiftCode_rewardId_key` ON `GiftCode`;

-- AlterTable
ALTER TABLE `GiftCode` DROP COLUMN `rewardId`;

-- CreateTable
CREATE TABLE `_GiftCodeToReward` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GiftCodeToReward_AB_unique`(`A`, `B`),
    INDEX `_GiftCodeToReward_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GiftCodeToReward` ADD CONSTRAINT `_GiftCodeToReward_A_fkey` FOREIGN KEY (`A`) REFERENCES `GiftCode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GiftCodeToReward` ADD CONSTRAINT `_GiftCodeToReward_B_fkey` FOREIGN KEY (`B`) REFERENCES `Reward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

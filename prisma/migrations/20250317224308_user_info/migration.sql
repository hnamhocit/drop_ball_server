/*
  Warnings:

  - You are about to drop the column `address` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Reward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Reward` DROP COLUMN `address`,
    DROP COLUMN `displayName`,
    DROP COLUMN `phoneNumber`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `displayName` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL;

/*
  Warnings:

  - Added the required column `usedByUins` to the `GiftCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GiftCode` ADD COLUMN `usedByUins` JSON NOT NULL;

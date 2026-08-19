/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PartyMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PartyMember" DROP COLUMN "createdAt",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

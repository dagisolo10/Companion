/*
  Warnings:

  - You are about to drop the column `userId` on the `QuestActivity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestActivity" DROP CONSTRAINT "QuestActivity_userId_fkey";

-- AlterTable
ALTER TABLE "QuestActivity" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "QuestActivity_questId_idx" ON "QuestActivity"("questId");

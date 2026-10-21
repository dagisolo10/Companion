/*
  Warnings:

  - A unique constraint covering the columns `[questId,userId]` on the table `QuestActivity` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `QuestActivity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Quest" DROP CONSTRAINT "Quest_recipientId_fkey";

-- AlterTable
ALTER TABLE "Quest" DROP COLUMN "recipientId";

-- AlterTable
ALTER TABLE "QuestActivity" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "QuestActivity_userId_idx" ON "QuestActivity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestActivity_questId_userId_key" ON "QuestActivity"("questId", "userId");

-- AddForeignKey
ALTER TABLE "QuestActivity" ADD CONSTRAINT "QuestActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

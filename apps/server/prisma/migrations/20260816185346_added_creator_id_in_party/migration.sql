/*
  Warnings:

  - A unique constraint covering the columns `[userId,partyId]` on the table `PartyMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Party` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PartyMember_userId_partyId_key" ON "PartyMember"("userId", "partyId");

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

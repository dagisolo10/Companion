-- CreateTable
CREATE TABLE "QuestActivity" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestActivity" ADD CONSTRAINT "QuestActivity_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestActivity" ADD CONSTRAINT "QuestActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

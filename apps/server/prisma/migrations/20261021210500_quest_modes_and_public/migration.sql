-- Rename quest mode value to match product terminology
ALTER TYPE "Mode" RENAME VALUE 'Race' TO 'Rush';

-- Opt-in profile visibility flag (default: public)
ALTER TABLE "User" ADD COLUMN "public" BOOLEAN NOT NULL DEFAULT true;

-- Store the actual XP amount awarded per completion instead of a boolean flag
ALTER TABLE "QuestActivity" ALTER COLUMN "xpAwarded" DROP DEFAULT;
ALTER TABLE "QuestActivity" ALTER COLUMN "xpAwarded" TYPE INTEGER USING (CASE WHEN "xpAwarded" THEN 1 ELSE 0 END);
UPDATE "QuestActivity" qa SET "xpAwarded" = q."reward" FROM "Quest" q WHERE qa."questId" = q."id" AND qa."xpAwarded" = 1;
ALTER TABLE "QuestActivity" ALTER COLUMN "xpAwarded" SET DEFAULT 0;

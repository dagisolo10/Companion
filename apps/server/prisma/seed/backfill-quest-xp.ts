import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

async function main() {
    const pending = await prisma.questActivity.findMany({
        where: { xpAwarded: false },
        select: {
            id: true,
            userId: true,
            quest: { select: { reward: true } },
        },
    });

    if (pending.length === 0) {
        console.log("No quest activities pending XP backfill.");
        return;
    }

    const perUser = new Map<string, number>();

    await prisma.$transaction(async (tx) => {
        for (const activity of pending) {
            await tx.user.update({
                where: { id: activity.userId },
                data: { experience: { increment: activity.quest.reward } },
            });

            await tx.questActivity.update({
                where: { id: activity.id },
                data: { xpAwarded: true },
            });

            perUser.set(activity.userId, (perUser.get(activity.userId) ?? 0) + activity.quest.reward);
        }
    });

    const total = [...perUser.values()].reduce((sum, xp) => sum + xp, 0);
    console.log(`Backfilled ${pending.length} quest activities, awarding ${total} XP across ${perUser.size} users.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

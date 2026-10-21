import { PrismaService } from "@/config/prisma/prisma.service.js";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

@Injectable()
export class StreakService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Bumps the daily streak inside the quest-completion transaction.
     * Must run BEFORE the new QuestActivity row is created so the latest
     * activity is the user's previous one.
     *
     * - last completion today: streak already counted, unchanged
     * - last completion yesterday: streak continues (+1)
     * - anything older (or none): streak resets to 1
     */
    async bumpStreak(tx: Prisma.TransactionClient, userId: string) {
        const now = new Date();
        const today = startOfDay(now);
        const yesterday = today - DAY_MS;

        const [user, lastActivity] = await Promise.all([
            tx.user.findUnique({ where: { id: userId }, select: { streak: true, longestStreak: true } }),
            tx.questActivity.findFirst({
                where: { userId },
                orderBy: { completedAt: "desc" },
                select: { completedAt: true },
            }),
        ]);

        if (!user) return;

        let streak = 1;

        if (lastActivity) {
            const lastDay = startOfDay(lastActivity.completedAt);

            if (lastDay === yesterday) streak = user.streak + 1;
            else if (lastDay === today) streak = Math.max(user.streak, 1);
        }

        await tx.user.update({
            where: { id: userId },
            data: {
                streak,
                longestStreak: Math.max(user.longestStreak, streak),
            },
        });
    }

    /**
     * Lazily resets stale streaks on read: a streak stays alive while the user
     * completed at least one quest yesterday or today, and resets to 0 once
     * their last completion is older than that. One groupBy covers all users.
     */
    async resolveStreaks<T extends { id: string; streak: number }>(users: T[]): Promise<T[]> {
        const active = users.filter((user) => user.streak > 0);

        if (active.length === 0) return users;

        const groups = await this.prisma.questActivity.groupBy({
            by: ["userId"],
            where: { userId: { in: active.map((user) => user.id) } },
            _max: { completedAt: true },
        });

        const lastCompletedAt = new Map(groups.map((group) => [group.userId, group._max.completedAt]));
        const yesterday = startOfDay(new Date()) - DAY_MS;

        const expiredIds: string[] = [];

        const resolved = users.map((user) => {
            if (user.streak <= 0) return user;

            const last = lastCompletedAt.get(user.id);

            if (last && last.getTime() >= yesterday) return user;

            expiredIds.push(user.id);
            return { ...user, streak: 0 };
        });

        if (expiredIds.length > 0) {
            await this.prisma.user.updateMany({
                where: { id: { in: expiredIds } },
                data: { streak: 0 },
            });
        }

        return resolved;
    }
}

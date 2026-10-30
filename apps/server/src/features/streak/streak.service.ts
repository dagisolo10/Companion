import { isAfter, isToday, isYesterday, startOfDay, subDays } from "date-fns";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";


@Injectable()
export class StreakService {
    constructor(private readonly prisma: PrismaService) {}

    async bumpStreak(tx: Prisma.TransactionClient, userId: string) {
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
            streak = isYesterday(lastDay) ? user.streak + 1 : isToday(lastDay) ? Math.max(user.streak, 1) : streak;
        }

        await tx.user.update({
            where: { id: userId },
            data: {
                streak,
                longestStreak: Math.max(user.longestStreak, streak),
            },
        });
    }

    async resolveStreaks<T extends { id: string; streak: number }>(users: T[]): Promise<T[]> {
        const yesterday = subDays(new Date(), 1);
        const active = users.filter((user) => user.streak > 0);

        if (active.length === 0) return users;

        const groups = await this.prisma.questActivity.groupBy({
            by: ["userId"],
            where: { userId: { in: active.map(({ id }) => id) } },
            _max: { completedAt: true },
        });

        const lastCompletedAt = new Map(groups.map((group) => [group.userId, group._max.completedAt]));

        const expiredIds: string[] = [];

        const resolved = users.map((user) => {
            if (user.streak <= 0) return user;

            const last = lastCompletedAt.get(user.id);

            if (last && isAfter(last, yesterday)) return user;

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

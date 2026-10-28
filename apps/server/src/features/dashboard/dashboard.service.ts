import { PrismaService } from "@/common/prisma/prisma.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { Injectable } from "@nestjs/common";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns";

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    async getDashboard() {
        const userId = this.requestService.getUserId();

        const now = new Date();

        const activities = await this.prisma.questActivity.findMany({
            where: {
                userId,
            },
            select: {
                xpAwarded: true,
                completedAt: true,
            },
        });

        let weekXp = 0;
        let monthXp = 0;
        let todayXp = 0;
        let allTimeXp = 0;
        let weekCompleted = 0;
        let todayCompleted = 0;
        let monthCompleted = 0;
        const allTimeCompleted = activities.length;

        for (const activity of activities) {
            const xp = activity.xpAwarded;
            const date = activity.completedAt;

            allTimeXp += xp;

            if (date >= startOfDay(now)) {
                todayCompleted++;
                todayXp += xp;
            }
            if (date >= startOfWeek(now)) {
                weekCompleted++;
                weekXp += xp;
            }
            if (date >= startOfMonth(now)) {
                monthCompleted++;
                monthXp += xp;
            }
        }

        return {
            weekXp,
            monthXp,
            todayXp,
            allTimeXp,
            weekCompleted,
            todayCompleted,
            monthCompleted,
            allTimeCompleted,
        };
    }
}

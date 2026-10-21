import { PrismaService } from "@/config/prisma/prisma.service.js";
import { RequestService } from "@/config/request/request.service.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    async getDashboard() {
        const userId = this.requestService.getUserId();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activities = await this.prisma.questActivity.findMany({
            where: {
                userId,
            },
            select: {
                completedAt: true,
                quest: {
                    select: { reward: true },
                },
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
            const xp = activity.quest.reward;
            const date = activity.completedAt;

            allTimeXp += xp;

            if (date >= startOfDay) {
                todayCompleted++;
                todayXp += xp;
            }
            if (date >= startOfWeek) {
                weekCompleted++;
                weekXp += xp;
            }
            if (date >= startOfMonth) {
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

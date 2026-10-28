import { PrismaService } from "@/common/prisma/prisma.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuestActivityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    async getMyQuestActivities(take = 50) {
        const userId = this.requestService.getUserId();

        return this.prisma.questActivity.findMany({
            where: {
                quest: {
                    party: { members: { some: { userId } } },
                },
            },
            take,
            orderBy: {
                completedAt: "desc",
            },
            select: {
                id: true,
                completedAt: true,
                xpAwarded: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                quest: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        reward: true,
                        difficulty: true,
                        mode: true,
                        creator: {
                            select: {
                                name: true,
                                username: true,
                            },
                        },
                        party: {
                            select: {
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
}

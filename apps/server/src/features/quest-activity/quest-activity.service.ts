import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuestActivityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    async getMyQuestActivities() {
        const recipientId = this.requestService.getUserId();

        return this.prisma.questActivity.findMany({
            where: {
                quest: {
                    recipientId,
                },
            },
            orderBy: {
                completedAt: "desc",
            },
            select: {
                completedAt: true,
                quest: {
                    select: {
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
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
}

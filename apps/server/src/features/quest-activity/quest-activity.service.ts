import { PrismaService } from "@/common/prisma/prisma.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { Injectable } from "@nestjs/common";
import { PageParams, paginate } from "@/common/pagination.js";

@Injectable()
export class QuestActivityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    async getMyQuestActivities(page: PageParams, legacyTake?: number) {
        const userId = this.requestService.getUserId();

        const findActivities = ({ skip, take }: { skip?: number; take?: number }) =>
            this.prisma.questActivity.findMany({
                where: {
                    quest: {
                        party: { members: { some: { userId } } },
                    },
                },
                ...(skip !== undefined && { skip }),
                ...(take !== undefined && { take }),
                orderBy: {
                    completedAt: "desc",
                },
                select: {
                    id: true,
                    xpAwarded: true,
                    completedAt: true,
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
                            mode: true,
                            title: true,
                            reward: true,
                            difficulty: true,
                            description: true,
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
        return legacyTake ? findActivities({ take: legacyTake }) : paginate(page, findActivities);
    }
}

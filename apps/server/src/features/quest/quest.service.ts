import { PrismaService } from "@/config/prisma/prisma.service.js";
import { RequestService } from "@/config/request/request.service.js";
import { CreateQuestDto, Filter, UpdateQuestDto } from "@/features/quest/quest.dto.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Difficulty, Prisma } from "@prisma/client";

const questSelect = {
    creator: {
        select: {
            name: true,
            username: true,
        },
    },
    party: {
        select: {
            code: true,
        },
    },
    _count: {
        select: {
            questActivities: true,
        },
    },
} satisfies Prisma.QuestInclude;

@Injectable()
export class QuestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
        private readonly streakService: StreakService,
    ) {}

    private readonly QUEST_REWARDS: Record<Difficulty, number> = {
        Tiny: 5,
        Easy: 10,
        Normal: 25,
        Hard: 50,
        Major: 100,
    };

    async createQuest(data: CreateQuestDto) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({
            where: { code: data.partyId },
        });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const isMember = await this.prisma.partyMember.findUnique({
            where: {
                userId_partyId: {
                    userId,
                    partyId: party.id,
                },
            },
        });

        if (!isMember) {
            throw new ForbiddenException("You are not allowed to create a quest in this party");
        }

        return await this.prisma.quest.create({
            data: {
                title: data.title,
                description: data.description,
                mode: data.mode,
                difficulty: data.difficulty,
                partyId: party.id,
                creatorId: userId,
                reward: this.QUEST_REWARDS[data.difficulty],
            },
            include: questSelect,
        });
    }

    async getPartyQuests(code: string) {
        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        return await this.prisma.quest.findMany({
            where: { partyId: party.id },
            include: questSelect,
        });
    }

    async getMyQuests(status?: Filter) {
        const userId = this.requestService.getUserId();

        return await this.prisma.quest.findMany({
            where: {
                party: { members: { some: { userId } } },
                ...(status !== "All" && { status }),
            },
            include: {
                ...questSelect,
                questActivities: {
                    where: { userId },
                    select: { id: true },
                },
            },
        });
    }

    async getQuest(id: string, code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const isMember = await this.prisma.partyMember.findUnique({
            where: { userId_partyId: { userId, partyId: party.id } },
        });

        if (!isMember) {
            throw new ForbiddenException("You are not allowed to view this quest in this party");
        }

        const quest = await this.prisma.quest.findFirst({
            where: { id, partyId: party.id },
            include: {
                ...questSelect,
                questActivities: {
                    orderBy: { completedAt: "desc" },
                    select: {
                        id: true,
                        completedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        return quest;
    }

    async completeQuest(id: string, code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const isMember = await this.prisma.partyMember.findUnique({
            where: { userId_partyId: { userId, partyId: party.id } },
        });

        if (!isMember) {
            throw new ForbiddenException("You are not allowed to complete this quest");
        }

        const quest = await this.prisma.quest.findFirst({
            where: { id, partyId: party.id },
        });

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        await this.prisma.$transaction(async (tx) => {
            const existingActivity = await tx.questActivity.findUnique({
                where: { questId_userId: { questId: id, userId } },
            });

            if (existingActivity) {
                throw new BadRequestException("You have already completed this quest");
            }

            await this.streakService.bumpStreak(tx, userId);

            await tx.questActivity.create({ data: { questId: id, userId, xpAwarded: true } });

            await tx.user.update({
                where: { id: userId },
                data: { experience: { increment: quest.reward } },
            });

            const memberCount = await tx.partyMember.count({
                where: { partyId: party.id },
            });
            const activityCount = await tx.questActivity.count({
                where: { questId: id },
            });

            if (activityCount >= memberCount) {
                await tx.quest.updateMany({
                    where: { id, status: "Active" },
                    data: {
                        status: "Completed",
                        completedAt: new Date(),
                    },
                });
            }
        });

        return await this.prisma.quest.findUnique({
            where: { id },
            include: questSelect,
        });
    }

    async updateQuest(id: string, data: UpdateQuestDto) {
        const userId = this.requestService.getUserId();

        const quest = await this.prisma.quest.findUnique({ where: { id } });

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        if (quest.creatorId !== userId) {
            throw new ForbiddenException("You are not allowed to update this quest");
        }

        const result = await this.prisma.quest.updateMany({
            where: {
                id,
                creatorId: userId,
                status: "Active",
            },
            data: {
                mode: data.mode,
                title: data.title,
                description: data.description,
                ...(data.difficulty && { reward: this.QUEST_REWARDS[data.difficulty] }),
            },
        });

        if (result.count === 0) {
            throw new BadRequestException("Completed quests can't be updated");
        }

        return await this.prisma.quest.findUnique({
            where: { id },
            include: questSelect,
        });
    }
}

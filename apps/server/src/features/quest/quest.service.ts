import { CreateQuestDto } from "./dto/create-quest.dto";
import { UpdateQuestDto } from "./dto/update-quest.dto";

import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Difficulty } from "@prisma/client";

@Injectable()
export class QuestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
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
            where: { id: data.partyId },
        });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const isMember = await this.prisma.partyMember.findUnique({
            where: {
                userId_partyId: {
                    userId,
                    partyId: data.partyId,
                },
            },
        });

        if (!isMember) {
            throw new ForbiddenException("You are not allowed to create a quest in this party");
        }

        const recipient = await this.prisma.partyMember.findUnique({
            where: {
                userId_partyId: {
                    userId: data.recipientId,
                    partyId: data.partyId,
                },
            },
        });

        if (!recipient) {
            throw new BadRequestException("Quest recipient must be a member of this party");
        }

        return await this.prisma.quest.create({
            data: {
                ...data,
                creatorId: userId,
                reward: this.QUEST_REWARDS[data.difficulty],
            },
        });
    }

    async getPartyQuests(code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

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
            throw new ForbiddenException("You are not allowed to view quests in this party");
        }

        return await this.prisma.quest.findMany({
            where: {
                partyId: party.id,
            },
        });
    }

    async getMyQuests(code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

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
            throw new ForbiddenException("You are not allowed to view quests in this party");
        }

        return await this.prisma.quest.findMany({
            where: {
                partyId: party.id,
                recipientId: userId,
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
            where: {
                userId_partyId: {
                    userId,
                    partyId: party.id,
                },
            },
        });

        if (!isMember) {
            throw new ForbiddenException("You are not allowed to view this quest in this party");
        }

        const quest = await this.prisma.quest.findFirst({
            where: {
                id,
                partyId: party.id,
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

        const quest = await this.prisma.quest.findFirst({ where: { id, partyId: party.id } });

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        if (quest.recipientId !== userId) {
            throw new ForbiddenException("Only the quest recipient can complete this quest");
        }

        await this.prisma.$transaction(async (tx) => {
            const result = await tx.quest.updateMany({
                where: {
                    id,
                    status: "Active",
                    partyId: party.id,
                    recipientId: userId,
                },
                data: {
                    status: "Completed",
                    completedAt: new Date(),
                },
            });

            if (result.count === 0) {
                throw new BadRequestException("Quest is already completed");
            }

            await tx.questActivity.create({ data: { questId: id } });
        });

        return await this.prisma.quest.findUnique({ where: { id } });
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

        if (data.recipientId !== undefined) {
            if (!data.recipientId) {
                throw new BadRequestException("Recipient ID can't be empty");
            }

            const recipient = await this.prisma.partyMember.findUnique({
                where: {
                    userId_partyId: {
                        userId: data.recipientId,
                        partyId: quest.partyId,
                    },
                },
            });

            if (!recipient) {
                throw new BadRequestException("Quest recipient must be a member of this party");
            }
        }

        const result = await this.prisma.quest.updateMany({
            where: {
                id,
                creatorId: userId,
                status: "Active",
            },
            data: {
                ...data,
                ...(data.difficulty && { reward: this.QUEST_REWARDS[data.difficulty] }),
            },
        });

        if (result.count === 0) {
            throw new BadRequestException("Completed quests can't be updated");
        }

        return await this.prisma.quest.findUnique({ where: { id } });
    }
}

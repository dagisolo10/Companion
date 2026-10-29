import { PageParams, paginate } from "@/common/pagination.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { CreateQuestDto, Filter, UpdateQuestDto } from "@/features/quest/quest.dto.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Difficulty, Mode, Prisma, QuestStatus } from "@prisma/client";
import { addHours, addMinutes } from "date-fns";

const NORMAL_XP_RATES = [1, 0.75, 0.5, 0.25];

const questSelect = {
    id: true,
    reward: true,
    title: true,
    description: true,
    mode: true,
    difficulty: true,
    status: true,
    completedAt: true,
    createdAt: true,
    startsAt: true,
    expiresAt: true,
    partyId: true,
    creatorId: true,
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
    _count: {
        select: {
            questActivities: true,
        },
    },
} satisfies Prisma.QuestSelect;

@Injectable()
export class QuestService implements OnModuleInit, OnModuleDestroy {
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

    private readonly questTimers = new Map<string, ReturnType<typeof setTimeout>>();

    async onModuleInit() {
        const quests = await this.prisma.quest.findMany({ where: { status: { in: ["Upcoming", "Active"] } }, select: { id: true, startsAt: true, expiresAt: true, status: true } });
        for (const quest of quests) this.scheduleQuest(quest);
        await this.refreshDueQuestStatuses();
    }

    onModuleDestroy() {
        for (const timer of this.questTimers.values()) clearTimeout(timer);
        this.questTimers.clear();
    }

    private scheduleAt(id: string, date: Date, callback: () => Promise<void>) {
        const remaining = date.getTime() - Date.now();
        const maxDelay = 2_147_000_000;
        const timer = setTimeout(
            () => {
                if (remaining > maxDelay) {
                    this.scheduleAt(id, date, callback);
                    return;
                }
                void callback().catch(() => undefined);
            },
            Math.min(Math.max(remaining, 0), maxDelay),
        );
        this.questTimers.set(id, timer);
    }

    private scheduleQuest(quest: { id: string; startsAt: Date; expiresAt: Date | null; status: QuestStatus }) {
        const existingTimer = this.questTimers.get(quest.id);
        if (existingTimer) clearTimeout(existingTimer);

        if (quest.status === "Upcoming") {
            this.scheduleAt(quest.id, quest.startsAt, async () => {
                await this.refreshQuestStatus(quest.id);
                const current = await this.prisma.quest.findUnique({ where: { id: quest.id }, select: { id: true, startsAt: true, expiresAt: true, status: true } });
                if (current && (current.status === "Upcoming" || current.status === "Active")) this.scheduleQuest(current);
            });
        } else if (quest.expiresAt) {
            this.scheduleAt(quest.id, quest.expiresAt, async () => {
                await this.refreshQuestStatus(quest.id);
                this.questTimers.delete(quest.id);
            });
        }
    }

    private async refreshQuestStatus(id: string) {
        const quest = await this.prisma.quest.findUnique({ where: { id }, select: { id: true, startsAt: true, expiresAt: true, status: true } });
        if (!quest) return;

        const now = new Date();
        if (quest.status === "Active" && quest.startsAt > now) {
            await this.prisma.quest.updateMany({ where: { id, status: "Active", startsAt: { gt: now } }, data: { status: "Upcoming" } });
            this.scheduleQuest({ ...quest, status: "Upcoming" });
            return;
        }

        if (quest.status === "Upcoming" && quest.startsAt <= now) {
            await this.prisma.quest.updateMany({ where: { id, status: "Upcoming", startsAt: { lte: now } }, data: { status: "Active" } });
        }

        const current = await this.prisma.quest.findUnique({ where: { id }, select: { status: true, expiresAt: true } });
        if (current?.status === "Active" && current.expiresAt && current.expiresAt <= now) {
            await this.prisma.quest.updateMany({ where: { id, status: "Active", expiresAt: { lte: now } }, data: { status: "Expired" } });
        }
    }

    private async refreshDueQuestStatuses() {
        const now = new Date();
        const activeBeforeStart = await this.prisma.quest.findMany({ where: { status: "Active", startsAt: { gt: now } }, select: { id: true, startsAt: true, expiresAt: true } });
        if (activeBeforeStart.length > 0) {
            await this.prisma.quest.updateMany({ where: { status: "Active", startsAt: { gt: now } }, data: { status: "Upcoming" } });
            for (const quest of activeBeforeStart) this.scheduleQuest({ ...quest, status: "Upcoming" });
        }
        await this.prisma.quest.updateMany({ where: { status: "Upcoming", startsAt: { lte: now } }, data: { status: "Active" } });
        await this.prisma.quest.updateMany({ where: { status: "Active", expiresAt: { lte: now } }, data: { status: "Expired" } });
    }

    async createQuest(data: CreateQuestDto) {
        const userId = this.requestService.getUserId();

        const party = await this.checkMemberShip(userId, data.code, "You are not allowed to create a quest in this party");

        const now = new Date();
        const startsAt = addMinutes(now, 15);
        const expiresAt = data.expirationHours ? addHours(startsAt, data.expirationHours) : null;
        const quest = await this.prisma.quest.create({
            data: {
                status: "Upcoming",
                startsAt,
                expiresAt,
                mode: data.mode,
                partyId: party.id,
                title: data.title,
                creatorId: userId,
                difficulty: data.difficulty,
                description: data.description,
                reward: this.QUEST_REWARDS[data.difficulty],
            },
            select: questSelect,
        });
        this.scheduleQuest({ id: quest.id, status: quest.status, startsAt: quest.startsAt, expiresAt: quest.expiresAt });
        return quest;
    }

    async getPartyQuests(code: string, status?: Filter, page?: PageParams) {
        await this.refreshDueQuestStatuses();
        const userId = this.requestService.getUserId();
        const p = await this.prisma.party.findUnique({ where: { code } });

        if (!p) {
            throw new NotFoundException("Party not found");
        }

        const findQuests = (args: { skip?: number; take?: number }) =>
            this.prisma.quest.findMany({
                where: { partyId: p.id, ...(status !== "All" && { status }) },
                ...args,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                select: {
                    ...questSelect,
                    questActivities: {
                        where: { userId },
                        select: { id: true },
                    },
                },
            });
        return page ? paginate(page, ({ skip, take }) => findQuests({ skip, take })) : findQuests({});
    }

    async getMyQuests(status?: Filter, take = 100, page?: PageParams) {
        await this.refreshDueQuestStatuses();
        const userId = this.requestService.getUserId();

        const findQuests = (args: { skip?: number; take?: number }) =>
            this.prisma.quest.findMany({
                where: {
                    party: { members: { some: { userId } } },
                    ...(status !== "All" && { status }),
                },
                ...args,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                select: {
                    ...questSelect,
                    questActivities: {
                        where: { userId },
                        select: { id: true },
                    },
                },
            });
        return page ? paginate(page, ({ skip, take: pageTake }) => findQuests({ skip, take: pageTake })) : findQuests({ take });
    }

    async getQuest(id: string, code: string) {
        await this.refreshQuestStatus(id);
        const userId = this.requestService.getUserId();

        const party = await this.checkMemberShip(userId, code, "You are not allowed to view this quest in this party");

        const quest = await this.prisma.quest.findFirst({
            where: { id, partyId: party.id },
            select: {
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

        console.log("QUEST", JSON.stringify(quest, null, 4));

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        const membership = await this.prisma.partyMember.findUnique({ where: { userId_partyId: { userId, partyId: party.id } }, select: { joinedAt: true } });
        return { ...quest, canParticipate: !!membership && membership.joinedAt <= quest.startsAt };
    }

    private calculateXpAwarded(reward: number, mode: Mode, rank: number): number {
        if (mode === Mode.Rush) {
            return rank === 1 ? reward : 0;
        }

        const rate = NORMAL_XP_RATES[Math.min(rank, NORMAL_XP_RATES.length) - 1];

        return Math.round(reward * rate);
    }

    async completeQuest(id: string, code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.checkMemberShip(userId, code, "You are not allowed to complete this quest");

        await this.refreshQuestStatus(id);
        const quest = await this.prisma.quest.findFirst({ where: { id, partyId: party.id } });

        if (!quest) {
            throw new NotFoundException("Quest not found");
        }

        const result = await this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT "id" FROM "Quest" WHERE "id" = ${id} FOR UPDATE`;

            const currentQuest = await tx.quest.findUnique({ where: { id } });
            if (!currentQuest || currentQuest.partyId !== party.id) throw new NotFoundException("Quest not found");
            if (currentQuest.status === "Upcoming") return { error: "This quest is still in its upcoming phase" };
            if (currentQuest.status === "Expired" || (currentQuest.expiresAt && currentQuest.expiresAt <= new Date())) {
                if (currentQuest.status === "Active") await tx.quest.update({ where: { id }, data: { status: "Expired" } });
                return { error: "This quest has expired" };
            }
            if (currentQuest.status !== "Active") return { error: "This quest is no longer active" };

            const member = await tx.partyMember.findUnique({ where: { userId_partyId: { userId, partyId: party.id } } });
            if (!member || member.joinedAt > currentQuest.startsAt) return { error: "You joined this party after the quest started and cannot participate" };

            const existingActivity = await tx.questActivity.findUnique({
                where: { questId_userId: { questId: id, userId } },
            });

            if (existingActivity) {
                throw new BadRequestException("You have already completed this quest");
            }

            const priorCompletions = await tx.questActivity.count({ where: { questId: id } });

            const xpAwarded = this.calculateXpAwarded(currentQuest.reward, currentQuest.mode, priorCompletions + 1);

            await this.streakService.bumpStreak(tx, userId);

            await tx.questActivity.create({ data: { questId: id, userId, xpAwarded } });

            await tx.user.update({
                where: { id: userId },
                data: { experience: { increment: xpAwarded } },
            });

            const memberCount = await tx.partyMember.count({
                where: { partyId: party.id, joinedAt: { lte: currentQuest.startsAt } },
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
            return { error: undefined };
        });

        if (result.error) throw new BadRequestException(result.error);

        const updatedQuest = await this.prisma.quest.findUnique({
            where: { id },
            select: questSelect,
        });
        if (updatedQuest && updatedQuest.status !== "Active") this.questTimers.delete(id);
        return updatedQuest;
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

        await this.refreshQuestStatus(id);
        const result = await this.prisma.quest.updateMany({
            where: {
                id,
                creatorId: userId,
                status: "Upcoming",
            },
            data: {
                mode: data.mode,
                title: data.title,
                description: data.description,
                ...(data.difficulty && { reward: this.QUEST_REWARDS[data.difficulty] }),
            },
        });

        if (result.count === 0) {
            throw new BadRequestException("A quest can't be edited after it has started");
        }

        return await this.prisma.quest.findUnique({
            where: { id },
            select: questSelect,
        });
    }

    private async checkMemberShip(userId: string, code: string, error: string) {
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
            throw new ForbiddenException(error);
        }

        return party;
    }
}

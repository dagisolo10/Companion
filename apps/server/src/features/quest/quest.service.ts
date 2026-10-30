import { BadRequestException, ForbiddenException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { CreateQuestDto, Filter, UpdateQuestDto } from "@/features/quest/quest.dto.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { Difficulty, Mode, Prisma, QuestStatus } from "@prisma/client";
import { RequestService } from "@/common/request/request.service.js";
import type { Quest as SharedQuest } from "@companion/shared-types";
import { StreakService } from "@/features/streak/streak.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
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

type QuestRecord = Prisma.QuestGetPayload<{ select: typeof questSelect }>;

@Injectable()
export class QuestService implements OnModuleInit, OnModuleDestroy {
    constructor(
        private readonly prisma: PrismaService,
        private readonly streakService: StreakService,
        private readonly requestService: RequestService,
        private readonly socketIoService: SocketIoService,
    ) {}

    private readonly QUEST_REWARDS: Record<Difficulty, number> = {
        Tiny: 5,
        Easy: 10,
        Normal: 25,
        Hard: 50,
        Major: 100,
    };

    private readonly questTimers = new Map<string, Set<ReturnType<typeof setTimeout>>>();

    async onModuleInit() {
        const quests = await this.prisma.quest.findMany({ where: { status: { in: ["Upcoming", "Active"] } }, select: { id: true, startsAt: true, expiresAt: true, status: true } });
        for (const quest of quests) this.scheduleQuest(quest);
        await this.refreshDueQuestStatuses();
    }

    onModuleDestroy() {
        for (const timers of this.questTimers.values()) for (const timer of timers) clearTimeout(timer);
        this.questTimers.clear();
    }

    private clearQuestTimers(id: string) {
        const timers = this.questTimers.get(id);
        if (!timers) return;
        for (const timer of timers) clearTimeout(timer);
        this.questTimers.delete(id);
    }

    private scheduleAt(id: string, date: Date, callback: () => Promise<void>) {
        const remaining = date.getTime() - Date.now();
        const maxDelay = 2_147_000_000;
        let timer: ReturnType<typeof setTimeout>;
        timer = setTimeout(
            () => {
                this.questTimers.get(id)?.delete(timer);
                if (remaining > maxDelay) {
                    this.scheduleAt(id, date, callback);
                    return;
                }
                void callback().catch(() => undefined);
            },
            Math.min(Math.max(remaining, 0), maxDelay),
        );
        const timers = this.questTimers.get(id) ?? new Set<ReturnType<typeof setTimeout>>();
        timers.add(timer);
        this.questTimers.set(id, timers);
    }

    private async notifyQuestLifecycle(event: "quest:started" | "quest:expiring" | "quest:expired" | "quest:completed", id: string, hoursRemaining?: 1 | 2) {
        const quest = await this.prisma.quest.findUnique({
            where: { id },
            select: questSelect,
        });
        if (!quest) return;
        const members = await this.prisma.partyMember.findMany({ where: { partyId: quest.partyId }, select: { userId: true } });
        this.socketIoService.emitToUsers(
            event,
            members.map(({ userId }) => userId),
            {
                partyCode: quest.party.code,
                quest: this.serializeQuest(quest),
                ...(hoursRemaining !== undefined && { hoursRemaining }),
            },
        );
    }

    private async notifyQuestChanged(event: "quest:created" | "quest:updated", quest: QuestRecord) {
        const members = await this.prisma.partyMember.findMany({ where: { partyId: quest.partyId }, select: { userId: true } });
        this.socketIoService.emitToUsers(
            event,
            members.map(({ userId }) => userId),
            {
                partyCode: quest.party.code,
                quest: this.serializeQuest(quest),
            },
        );
    }

    private serializeQuest(quest: QuestRecord): SharedQuest {
        return {
            ...quest,
            createdAt: quest.createdAt.toISOString(),
            startsAt: quest.startsAt.toISOString(),
            expiresAt: quest.expiresAt?.toISOString() ?? null,
            completedAt: quest.completedAt?.toISOString() ?? null,
        };
    }

    private async notifyLeaderboard(partyId: string, partyCode: string) {
        const members = await this.prisma.partyMember.findMany({ where: { partyId }, include: { user: true }, orderBy: { user: { experience: "desc" } } });
        const users = await this.streakService.resolveStreaks(members.map(({ user }) => user));
        const usersById = new Map(users.map((user) => [user.id, user]));
        this.socketIoService.emitToUsers(
            "party:leaderboard-updated",
            members.map(({ userId }) => userId),
            {
                partyCode,
                leaderboard: members.map((member) => ({
                    ...member,
                    joinedAt: member.joinedAt.toISOString(),
                    user: { ...usersById.get(member.userId)!, createdAt: usersById.get(member.userId)!.createdAt.toISOString() },
                })),
            },
        );
    }

    private scheduleQuest(quest: { id: string; startsAt: Date; expiresAt: Date | null; status: QuestStatus }) {
        this.clearQuestTimers(quest.id);

        if (quest.status === "Upcoming") {
            this.scheduleAt(quest.id, quest.startsAt, async () => {
                await this.refreshQuestStatus(quest.id);
                const current = await this.prisma.quest.findUnique({ where: { id: quest.id }, select: { id: true, startsAt: true, expiresAt: true, status: true } });
                if (current && (current.status === "Upcoming" || current.status === "Active")) this.scheduleQuest(current);
            });
        }

        if (quest.expiresAt && (quest.status === "Upcoming" || quest.status === "Active")) {
            for (const hoursRemaining of [2, 1] as const) {
                const warningAt = addHours(quest.expiresAt, -hoursRemaining);
                if (warningAt > new Date()) {
                    this.scheduleAt(quest.id, warningAt, async () => {
                        await this.notifyQuestLifecycle("quest:expiring", quest.id, hoursRemaining);
                    });
                }
            }
            this.scheduleAt(quest.id, quest.expiresAt, async () => {
                await this.refreshQuestStatus(quest.id);
                this.clearQuestTimers(quest.id);
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
            const result = await this.prisma.quest.updateMany({ where: { id, status: "Upcoming", startsAt: { lte: now } }, data: { status: "Active" } });
            if (result.count > 0) await this.notifyQuestLifecycle("quest:started", id);
        }

        const current = await this.prisma.quest.findUnique({ where: { id }, select: { status: true, expiresAt: true } });
        if (current?.status === "Active" && current.expiresAt && current.expiresAt <= now) {
            const result = await this.prisma.quest.updateMany({ where: { id, status: "Active", expiresAt: { lte: now } }, data: { status: "Expired" } });
            if (result.count > 0) await this.notifyQuestLifecycle("quest:expired", id);
            this.clearQuestTimers(id);
        }
    }

    private async refreshDueQuestStatuses() {
        const now = new Date();
        const dueQuests = await this.prisma.quest.findMany({
            where: {
                OR: [
                    { status: "Active", startsAt: { gt: now } },
                    { status: "Upcoming", startsAt: { lte: now } },
                    { status: "Active", expiresAt: { lte: now } },
                ],
            },
            select: { id: true, startsAt: true, expiresAt: true, status: true },
        });
        for (const quest of dueQuests) await this.refreshQuestStatus(quest.id);
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
        await this.notifyQuestChanged("quest:created", quest);
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
            if (currentQuest.status === "Upcoming") return { error: "This quest is still in its upcoming phase", expired: false };
            if (currentQuest.status === "Expired" || (currentQuest.expiresAt && currentQuest.expiresAt <= new Date())) {
                const expiredNow = currentQuest.status === "Active";
                if (expiredNow) await tx.quest.update({ where: { id }, data: { status: "Expired" } });
                return { error: "This quest has expired", expired: expiredNow };
            }
            if (currentQuest.status !== "Active") return { error: "This quest is no longer active", expired: false };

            const member = await tx.partyMember.findUnique({ where: { userId_partyId: { userId, partyId: party.id } } });
            if (!member || member.joinedAt > currentQuest.startsAt) return { error: "You joined this party after the quest started and cannot participate", expired: false };

            const existingActivity = await tx.questActivity.findUnique({
                where: { questId_userId: { questId: id, userId } },
            });

            if (existingActivity) {
                throw new BadRequestException("You have already completed this quest");
            }

            const priorCompletions = await tx.questActivity.count({ where: { questId: id } });

            const xpAwarded = this.calculateXpAwarded(currentQuest.reward, currentQuest.mode, priorCompletions + 1);

            await this.streakService.bumpStreak(tx, userId);

            const activity = await tx.questActivity.create({ data: { questId: id, userId, xpAwarded } });

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

            const completed = activityCount >= memberCount;
            if (completed) {
                await tx.quest.updateMany({
                    where: { id, status: "Active" },
                    data: {
                        status: "Completed",
                        completedAt: new Date(),
                    },
                });
            }
            return { error: undefined, expired: false, activity, completed };
        });

        if (result.error) {
            if (result.expired) {
                await this.notifyQuestLifecycle("quest:expired", id);
                this.clearQuestTimers(id);
            }
            throw new BadRequestException(result.error);
        }
        if (!result.activity) throw new BadRequestException("Quest completion could not be recorded");

        const updatedQuest = await this.prisma.quest.findUnique({
            where: { id },
            select: questSelect,
        });
        if (updatedQuest) {
            const [members, activity] = await Promise.all([
                this.prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } }),
                this.prisma.questActivity.findUniqueOrThrow({ where: { questId_userId: { questId: id, userId } }, include: { user: { select: { id: true, name: true, username: true } } } }),
            ]);
            this.socketIoService.emitToUsers(
                "quest:member-completed",
                members.map(({ userId: memberUserId }) => memberUserId),
                {
                    partyCode: party.code,
                    quest: this.serializeQuest(updatedQuest),
                    activity: { ...activity, completedAt: activity.completedAt.toISOString() },
                },
            );
            await this.notifyLeaderboard(party.id, party.code);
            if (result.completed) await this.notifyQuestLifecycle("quest:completed", id);
            if (updatedQuest.status !== "Active") this.clearQuestTimers(id);
        }
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

        const updatedQuest = await this.prisma.quest.findUnique({
            where: { id },
            select: questSelect,
        });
        if (updatedQuest) await this.notifyQuestChanged("quest:updated", updatedQuest);
        return updatedQuest;
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

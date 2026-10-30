import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RemoveMemberDto } from "@/features/party-member/party-member.dto.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
import { Prisma } from "@prisma/client";


@Injectable()
export class PartyMemberService {
    private readonly logger = new Logger(PartyMemberService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly streakService: StreakService,
        private readonly requestService: RequestService,
        private readonly socketIoService: SocketIoService,
    ) {}

    async joinParty(code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const existingMember = await this.prisma.partyMember.findUnique({
            where: {
                userId_partyId: {
                    userId,
                    partyId: party.id,
                },
            },
        });

        if (existingMember) {
            throw new BadRequestException("You are already a member of this party");
        }

        let member;
        try {
            member = await this.prisma.partyMember.create({ data: { userId, partyId: party.id } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new BadRequestException("You are already a member of this party");
            }
            throw error;
        }

        try {
            const [user, members] = await Promise.all([
                this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, username: true } }),
                this.prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } }),
            ]);
            const recipients = members.map(({ userId: memberUserId }) => memberUserId);
            this.socketIoService.emitToUsers("party:member-joined", recipients, {
                partyCode: party.code,
                partyName: party.name,
                member: { ...member, joinedAt: member.joinedAt.toISOString(), user },
                memberCount: members.length,
            });
            await this.emitLeaderboard(party.id, party.code, recipients);
        } catch (notifyError) {
            this.logger.warn(`party:member-joined broadcast failed: ${String(notifyError)}`);
        }

        return member;
    }

    async leaveParty(code: string) {
        const userId = this.requestService.getUserId();

        const partyMember = await this.prisma.partyMember.findFirst({
            where: { userId, party: { code } },
            include: { party: true, user: { select: { id: true, name: true, username: true } } },
        });

        if (!partyMember) {
            throw new NotFoundException("Party member not found");
        }

        if (partyMember.party.creatorId === userId) {
            throw new BadRequestException("Party creator must transfer ownership or delete the party before leaving");
        }

        await this.prisma.partyMember.delete({ where: { id: partyMember.id } });
        await this.notifyMemberLeft(partyMember.party, {
            id: partyMember.id,
            userId,
            partyId: partyMember.partyId,
            joinedAt: partyMember.joinedAt,
            user: partyMember.user,
        });

        return { success: true };
    }

    async getMembers(code: string, page?: PageParams) {
        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const findMembers = (args: { skip?: number; take?: number }) =>
            this.prisma.partyMember.findMany({
                where: { party: { code } },
                ...args,
                orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
                include: { user: { select: { id: true, name: true, username: true } } },
            });
        return page ? paginate(page, ({ skip, take }) => findMembers({ skip, take })) : findMembers({});
    }

    async removeMember(code: string, { partyMemberId }: RemoveMemberDto) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (party.creatorId !== userId) {
            throw new ForbiddenException("Only the party creator can remove members");
        }

        const partyMember = await this.prisma.partyMember.findFirst({
            where: { id: partyMemberId, party: { code } },
            include: { user: { select: { id: true, name: true, username: true } } },
        });

        if (!partyMember) {
            throw new NotFoundException("Party member not found");
        }

        if (partyMember.userId === userId) {
            throw new BadRequestException("The party creator can't remove themselves. Transfer ownership or delete the party");
        }

        const removedMember = await this.prisma.partyMember.delete({ where: { id: partyMemberId } });
        await this.notifyMemberLeft(party, { ...removedMember, user: partyMember.user });
        return removedMember;
    }

    private async notifyMemberLeft(party: { id: string; code: string; name: string }, member: { id: string; userId: string; partyId: string; joinedAt: Date; user: { id: string; name: string; username: string } }) {
        try {
            const remainingMembers = await this.prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } });
            const recipients = [...new Set([...remainingMembers.map(({ userId }) => userId), member.userId])];
            this.socketIoService.emitToUsers("party:member-left", recipients, {
                partyCode: party.code,
                partyName: party.name,
                member: { ...member, joinedAt: member.joinedAt.toISOString() },
                memberCount: remainingMembers.length,
            });
            await this.emitLeaderboard(party.id, party.code, remainingMembers.map(({ userId }) => userId));
        } catch (notifyError) {
            this.logger.warn(`party:member-left broadcast failed: ${String(notifyError)}`);
        }
    }

    private async emitLeaderboard(partyId: string, partyCode: string, recipients: string[]) {
        const leaderboard = await this.streakService.buildLeaderboardPayload(partyId);
        this.socketIoService.emitToUsers("party:leaderboard-updated", recipients, {
            partyCode,
            leaderboard,
        });
    }
}

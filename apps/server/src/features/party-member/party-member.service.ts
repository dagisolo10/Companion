import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RemoveMemberDto } from "@/features/party-member/party-member.dto.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
import { Prisma } from "@prisma/client";


@Injectable()
export class PartyMemberService {
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

        try {
            const member = await this.prisma.partyMember.create({ data: { userId, partyId: party.id } });

            const [user, members] = await Promise.all([this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, username: true } }), this.prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } })]);

            this.socketIoService.emitToUsers(
                "party:member-joined",
                members.map(({ userId: memberUserId }) => memberUserId),
                {
                    partyCode: party.code,
                    partyName: party.name,
                    member: { ...member, joinedAt: member.joinedAt.toISOString(), user },
                    memberCount: members.length,
                },
            );
            await this.emitLeaderboard(
                party.id,
                party.code,
                members.map(({ userId: memberUserId }) => memberUserId),
            );
            return member;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new BadRequestException("You are already a member of this party");
            }

            throw error;
        }
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

        const remainingMembers = await this.prisma.partyMember.findMany({ where: { partyId: partyMember.partyId }, select: { userId: true } });

        this.socketIoService.emitToUsers(
            "party:member-left",
            remainingMembers.map(({ userId: memberUserId }) => memberUserId),
            {
                partyCode: partyMember.party.code,
                partyName: partyMember.party.name,
                member: {
                    id: partyMember.id,
                    userId,
                    partyId: partyMember.partyId,
                    joinedAt: partyMember.joinedAt.toISOString(),
                    user: partyMember.user,
                },
                memberCount: remainingMembers.length,
            },
        );
        await this.emitLeaderboard(
            partyMember.partyId,
            partyMember.party.code,
            remainingMembers.map(({ userId: memberUserId }) => memberUserId),
        );

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

        const remainingMembers = await this.prisma.partyMember.findMany({ where: { partyId: party.id }, select: { userId: true } });
        this.socketIoService.emitToUsers(
            "party:member-left",
            remainingMembers.map(({ userId: memberUserId }) => memberUserId),
            {
                partyCode: party.code,
                partyName: party.name,
                member: {
                    ...removedMember,
                    joinedAt: removedMember.joinedAt.toISOString(),
                    user: partyMember.user,
                },
                memberCount: remainingMembers.length,
            },
        );
        await this.emitLeaderboard(
            party.id,
            party.code,
            remainingMembers.map(({ userId: memberUserId }) => memberUserId),
        );
        return removedMember;
    }

    private async emitLeaderboard(partyId: string, partyCode: string, recipients: string[]) {
        const members = await this.prisma.partyMember.findMany({ where: { partyId }, include: { user: true }, orderBy: { user: { experience: "desc" } } });
        const users = await this.streakService.resolveStreaks(members.map(({ user }) => user));
        const usersById = new Map(users.map((user) => [user.id, user]));
        this.socketIoService.emitToUsers("party:leaderboard-updated", recipients, {
            partyCode,
            leaderboard: members.map((member) => ({
                ...member,
                joinedAt: member.joinedAt.toISOString(),
                user: { ...usersById.get(member.userId)!, createdAt: usersById.get(member.userId)!.createdAt.toISOString() },
            })),
        });
    }
}

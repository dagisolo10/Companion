import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePartyDto, TransferPartyDto, UpdatePartyDto } from "@/features/party/party.dto.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
import { Prisma } from "@prisma/client";
import { ulid } from "ulid";


@Injectable()
export class PartyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly streakService: StreakService,
        private readonly requestService: RequestService,
        private readonly socketIoService: SocketIoService,
    ) {}

    private async generateUniquePartyCode() {
        let code: string;

        do {
            const id = ulid();
            code = id.slice(id.length - 5, id.length - 1);
        } while (await this.prisma.party.findUnique({ where: { code } }));

        return code;
    }

    async createParty({ name, public: isPublic = true }: CreatePartyDto) {
        const userId = this.requestService.getUserId();

        const code = await this.generateUniquePartyCode();

        return await this.prisma.party.create({
            data: {
                code,
                name,
                public: isPublic,
                creatorId: userId,
                members: { create: { userId } },
            },
        });
    }

    async regeneratePartyCode(id: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { id } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (party.creatorId !== userId) {
            throw new ForbiddenException("Only the party creator can regenerate party code");
        }

        const code = await this.generateUniquePartyCode();
        const updatedParty = await this.prisma.party.update({ where: { id }, data: { code } });

        const members = await this.prisma.partyMember.findMany({ where: { partyId: id }, select: { userId: true } });

        this.socketIoService.emitToUsers(
            "party:code-regenerated",
            members.map(({ userId: memberUserId }) => memberUserId),
            {
                previousCode: party.code,
                party: { ...updatedParty, createdAt: updatedParty.createdAt.toISOString() },
                memberCount: members.length,
            },
        );
        return updatedParty;
    }

    async getParty(code: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({
            where: { code },
            include: {
                _count: { select: { members: true } },
                members: { where: { userId }, select: { id: true } },
            },
        });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const { members, ...rest } = party;

        return { ...rest, isMember: members.length > 0 };
    }

    async getMyParties() {
        const userId = this.requestService.getUserId();

        const parties = await this.prisma.party.findMany({
            where: { members: { some: { userId } } },
            include: {
                _count: { select: { members: true } },
            },
        });

        return parties.map((party) => ({ ...party, isMember: true }));
    }

    async getAllParties(query?: string, page?: PageParams, excludeJoined = false) {
        const userId = this.requestService.getUserId();
        const trimmed = query?.trim();

        const findParties = ({ skip, take }: { skip?: number; take?: number }) =>
            this.prisma.party
                .findMany({
                    where: {
                        public: true,
                        ...(trimmed && { OR: [{ name: { contains: trimmed, mode: "insensitive" } }, { code: { contains: trimmed, mode: "insensitive" } }] }),
                        ...(excludeJoined && { members: { none: { userId } } }),
                    },
                    ...(skip !== undefined && { skip }),
                    ...(take !== undefined && { take }),
                    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                    include: {
                        _count: { select: { members: true } },
                        members: { where: { userId }, select: { id: true } },
                    },
                })
                .then((parties) => parties.map(({ members, ...party }) => ({ ...party, isMember: members.length > 0 })));

        if (!page) return findParties({ take: 100 });

        return paginate(page, async ({ skip, take }) => {
            return findParties({ skip, take });
        });
    }

    async getPartyLeaderboard(code: string) {
        const party = await this.prisma.party.findUnique({ where: { code }, select: { id: true } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        return this.streakService.buildLeaderboardPayload(party.id);
    }

    async searchParty(code: string) {
        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        return party;
    }

    async updateParty(id: string, data: UpdatePartyDto) {
        const userId = this.requestService.getUserId();

        await this.checkOwnership(userId, id, "Only the party creator can update party");
        const party = await this.prisma.party.update({ where: { id }, data });
        const members = await this.prisma.partyMember.findMany({ where: { partyId: id }, select: { userId: true } });
        const event = { party: { ...party, createdAt: party.createdAt.toISOString() }, memberCount: members.length };
        this.socketIoService.emitToUsers(
            "party:updated",
            members.map(({ userId: memberUserId }) => memberUserId),
            event,
        );
        return party;
    }
    async deleteParty(id: string) {
        const userId = this.requestService.getUserId();

        await this.checkOwnership(userId, id, "Only the party creator can delete party");

        const party = await this.prisma.party.findUniqueOrThrow({ where: { id } });
        const members = await this.prisma.partyMember.findMany({ where: { partyId: id }, select: { userId: true } });
        const deletedParty = await this.prisma.party.delete({ where: { id } });
        this.socketIoService.emitToUsers(
            "party:deleted",
            members.map(({ userId: memberUserId }) => memberUserId),
            { partyId: id, partyCode: party.code },
        );
        return deletedParty;
    }

    async transferParty(id: string, { partyMemberId }: TransferPartyDto) {
        const userId = this.requestService.getUserId();

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transferredParty = await this.prisma.$transaction(
                    async (tx) => {
                        const party = await tx.party.findUnique({ where: { id } });

                        if (!party) {
                            throw new NotFoundException("Party not found");
                        }

                        if (party.creatorId !== userId) {
                            throw new ForbiddenException("Only the party creator can transfer party ownership");
                        }

                        const partyMember = await tx.partyMember.findFirst({ where: { id: partyMemberId, partyId: party.id } });

                        if (!partyMember) {
                            throw new NotFoundException("Party member not found");
                        }

                        if (partyMember.userId === userId) {
                            throw new BadRequestException("You are already the party creator");
                        }

                        return tx.party.update({ where: { id: party.id, creatorId: userId }, data: { creatorId: partyMember.userId } });
                    },
                    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
                );
                const members = await this.prisma.partyMember.findMany({ where: { partyId: id }, select: { userId: true } });
                this.socketIoService.emitToUsers(
                    "party:updated",
                    members.map(({ userId: memberUserId }) => memberUserId),
                    {
                        party: { ...transferredParty, createdAt: transferredParty.createdAt.toISOString() },
                        memberCount: members.length,
                    },
                );
                return transferredParty;
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
                    continue;
                }

                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
                    throw new BadRequestException("Party ownership could not be transferred. Please try again");
                }

                throw error;
            }
        }

        throw new BadRequestException("Party ownership could not be transferred");
    }

    private async checkOwnership(userId: string, id: string, error: string) {
        const party = await this.prisma.party.findUnique({ where: { id } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (party.creatorId !== userId) {
            throw new ForbiddenException(error);
        }
    }
}

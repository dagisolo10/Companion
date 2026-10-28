import { PrismaService } from "@/common/prisma/prisma.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { CreatePartyDto, TransferPartyDto, UpdatePartyDto } from "@/features/party/party.dto.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ulid } from "ulid";

@Injectable()
export class PartyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
        private readonly streakService: StreakService,
    ) {}

    private async generateUniquePartyCode() {
        let code: string;

        do {
            const id = ulid();
            code = id.slice(id.length - 5, id.length - 1);
        } while (await this.prisma.party.findUnique({ where: { code } }));

        return code;
    }

    async createParty({ name }: CreatePartyDto) {
        const userId = this.requestService.getUserId();

        const code = await this.generateUniquePartyCode();

        return await this.prisma.party.create({
            data: {
                code,
                name,
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

        return await this.prisma.party.update({ where: { id }, data: { code } });
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

    async getAllParties(query?: string) {
        const userId = this.requestService.getUserId();
        const trimmed = query?.trim();

        const parties = await this.prisma.party.findMany({
            where: trimmed
                ? {
                      OR: [{ name: { contains: trimmed, mode: "insensitive" } }, { code: { contains: trimmed, mode: "insensitive" } }],
                  }
                : undefined,
            take: 100,
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { members: true } },
                members: { where: { userId }, select: { id: true } },
            },
        });

        return parties.map(({ members, ...party }) => ({
            ...party,
            isMember: members.length > 0,
        }));
    }

    async getPartyLeaderboard(code: string) {
        const party = await this.prisma.party.findUnique({ where: { code }, select: { id: true } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        const members = await this.prisma.partyMember.findMany({
            where: { partyId: party.id },
            include: { user: true },
            orderBy: { user: { experience: "desc" } },
        });

        const users = await this.streakService.resolveStreaks(members.map(({ user }) => user));
        const resolvedById = new Map(users.map((user) => [user.id, user]));

        return members.map((member) => ({ ...member, user: resolvedById.get(member.userId) ?? member.user }));
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

        return await this.prisma.party.update({ where: { id }, data });
    }
    async deleteParty(id: string) {
        const userId = this.requestService.getUserId();

        await this.checkOwnership(userId, id, "Only the party creator can delete party");

        return await this.prisma.party.delete({ where: { id } });
    }

    async transferParty(id: string, { partyMemberId }: TransferPartyDto) {
        const userId = this.requestService.getUserId();

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.prisma.$transaction(
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

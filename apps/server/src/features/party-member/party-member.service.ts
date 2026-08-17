import { RemoveMemberDto } from "./party-member.controller";

import { Prisma } from "@prisma/client";
import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class PartyMemberService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
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
            return await this.prisma.partyMember.create({
                data: {
                    userId,
                    partyId: party.id,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new BadRequestException("You are already a member of this party");
            }

            throw error;
        }
    }

    async leaveParty(code: string) {
        const userId = this.requestService.getUserId();

        const partyMember = await this.prisma.partyMember.findFirst({ where: { userId, party: { code } }, include: { party: true } });

        if (!partyMember) {
            throw new NotFoundException("Party member not found");
        }

        if (partyMember.party.creatorId === userId) {
            throw new BadRequestException("Party creator must transfer ownership or delete the party before leaving");
        }

        await this.prisma.partyMember.delete({ where: { id: partyMember.id } });
    }

    async getMembers(code: string) {
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
            throw new ForbiddenException("You don't belong to this party");
        }

        return await this.prisma.partyMember.findMany({ where: { party: { code } } });
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

        const partyMember = await this.prisma.partyMember.findFirst({ where: { id: partyMemberId, party: { code } } });

        if (!partyMember) {
            throw new NotFoundException("Party member not found");
        }

        if (partyMember.userId === userId) {
            throw new BadRequestException("The party creator can't remove themselves. Transfer ownership or delete the party");
        }

        return await this.prisma.partyMember.delete({ where: { id: partyMemberId } });
    }
}

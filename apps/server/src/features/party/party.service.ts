import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomInt } from "crypto";

@Injectable()
export class PartyService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly requestService: RequestService,
    ) {}

    private async generateUniquePartyCode() {
        let code: string;

        do {
            const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            code = Array.from({ length: 6 }, () => characters[randomInt(characters.length)]).join("");
        } while (await this.prisma.party.findUnique({ where: { code } }));

        return code;
    }

    async createParty() {
        const userId = this.requestService.getUserId();

        const code = await this.generateUniquePartyCode();

        return await this.prisma.party.create({
            data: {
                code,
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

        const party = await this.prisma.party.findUnique({ where: { code }, include: { members: { select: { userId: true } } } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (!party.members.some((m) => m.userId === userId)) {
            throw new ForbiddenException("You don't belong in this party");
        }

        return party;
    }

    async getMyParties() {
        const userId = this.requestService.getUserId();

        return await this.prisma.party.findMany({ where: { members: { some: { userId } } } });
    }

    async searchParty(code: string) {
        const party = await this.prisma.party.findUnique({ where: { code } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        return party;
    }

    async deleteParty(id: string) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { id } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (party.creatorId !== userId) {
            throw new ForbiddenException("Only the party creator can delete party");
        }

        return await this.prisma.party.delete({ where: { id } });
    }
}

import { CreatePartyDto, UpdatePartyDto } from "./dto/party.dto";

import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { TransferPartyDto } from "@/features/party/party.controller";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
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

    async updateParty(id: string, data: UpdatePartyDto) {
        const userId = this.requestService.getUserId();

        const party = await this.prisma.party.findUnique({ where: { id } });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        if (party.creatorId !== userId) {
            throw new ForbiddenException("Only the party creator can update party");
        }

        return await this.prisma.party.update({ where: { id }, data });
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
}

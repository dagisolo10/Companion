import { PartyService } from "@/features/party/party.service";
import { Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

@Controller("party")
export class PartyController {
    constructor(private readonly partyService: PartyService) {}

    @Post()
    async createParty() {
        await this.partyService.createParty();
    }

    @Get(":code")
    async getParty(@Param() code: string) {
        await this.partyService.getParty(code);
    }

    @Get("my")
    async getMyParties() {
        await this.partyService.getMyParties();
    }

    @Get("search/:code")
    async searchParty(@Param() code: string) {
        await this.partyService.searchParty(code);
    }

    @Patch(":id")
    async updateParty(@Param() id: string) {
        await this.partyService.regeneratePartyCode(id);
    }

    @Delete(":id")
    async deleteParty(@Param() id: string) {
        await this.partyService.deleteParty(id);
    }
}

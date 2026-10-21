import { CreatePartyDto, TransferPartyDto, UpdatePartyDto } from "@/features/party/party.dto.js";
import { PartyService } from "@/features/party/party.service.js";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

@Controller("party")
export class PartyController {
    constructor(private readonly partyService: PartyService) {}

    @Post("create")
    createParty(@Body() data: CreatePartyDto) {
        return this.partyService.createParty(data);
    }

    @Get("my")
    getMyParties() {
        return this.partyService.getMyParties();
    }

    @Get("all")
    getAllParties(@Query("q") query?: string) {
        return this.partyService.getAllParties(query);
    }

    @Get("leaderboard/:code")
    getPartyLeaderboard(@Param("code") code: string) {
        return this.partyService.getPartyLeaderboard(code);
    }

    @Get("search/:code")
    searchParty(@Param("code") code: string) {
        return this.partyService.searchParty(code);
    }

    @Get(":code")
    getParty(@Param("code") code: string) {
        return this.partyService.getParty(code);
    }

    @Patch("regenerate-code/:id")
    regeneratePartyCode(@Param("id") id: string) {
        return this.partyService.regeneratePartyCode(id);
    }

    @Patch(":id")
    updateParty(@Param("id") id: string, @Body() data: UpdatePartyDto) {
        return this.partyService.updateParty(id, data);
    }

    @Patch("transfer/:id")
    transferParty(@Param("id") id: string, @Body() data: TransferPartyDto) {
        return this.partyService.transferParty(id, data);
    }

    @Delete("delete/:id")
    deleteParty(@Param("id") id: string) {
        return this.partyService.deleteParty(id);
    }
}

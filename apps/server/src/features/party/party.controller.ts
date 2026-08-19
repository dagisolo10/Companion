import { CreatePartyDto, UpdatePartyDto } from "./dto/party.dto";

import { PartyService } from "@/features/party/party.service";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { IsString } from "class-validator";

export class TransferPartyDto {
    @IsString()
    partyMemberId!: string;
}

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

    @Get(":code")
    getParty(@Param("code") code: string) {
        return this.partyService.getParty(code);
    }

    @Get("search/:code")
    searchParty(@Param("code") code: string) {
        return this.partyService.searchParty(code);
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

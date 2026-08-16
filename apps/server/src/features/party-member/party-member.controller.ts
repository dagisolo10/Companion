import { PartyMemberService } from "./party-member.service";

import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { IsString } from "class-validator";

export class RemoveMemberDto {
    @IsString()
    partyMemberId!: string;
}

@Controller("party-member")
export class PartyMemberController {
    constructor(private readonly partyMemberService: PartyMemberService) {}

    @Get("members/:code")
    getMembers(@Param("code") code: string) {
        return this.partyMemberService.getMembers(code);
    }

    @Post("join/:code")
    joinParty(@Param("code") code: string) {
        return this.partyMemberService.joinParty(code);
    }

    @Delete("leave/:code")
    leaveParty(@Param("code") code: string) {
        return this.partyMemberService.leaveParty(code);
    }

    @Delete("remove/:code")
    removeMember(@Param("code") code: string, @Body() data: RemoveMemberDto) {
        return this.partyMemberService.removeMember(code, data);
    }
}

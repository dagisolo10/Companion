import { RemoveMemberDto } from "@/features/party-member/party-member.dto.js";
import { PartyMemberService } from "@/features/party-member/party-member.service.js";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";

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

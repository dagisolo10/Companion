import { RemoveMemberDto } from "@/features/party-member/party-member.dto.js";
import { PartyMemberService } from "@/features/party-member/party-member.service.js";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { Query } from "@nestjs/common";
import { parsePageParams } from "@/common/pagination.js";

@Controller("party-member")
export class PartyMemberController {
    constructor(private readonly partyMemberService: PartyMemberService) {}

    @Get("members/:code")
    getMembers(@Param("code") code: string, @Query("page") page?: string, @Query("limit") limit?: string) {
        return this.partyMemberService.getMembers(code, page ? parsePageParams(page, limit) : undefined);
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

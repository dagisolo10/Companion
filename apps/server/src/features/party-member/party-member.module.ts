import { PartyMemberController } from "@/features/party-member/party-member.controller.js";
import { PartyMemberService } from "@/features/party-member/party-member.service.js";
import { Module } from "@nestjs/common";

@Module({
    providers: [PartyMemberService],
    controllers: [PartyMemberController],
})
export class PartyMemberModule {}

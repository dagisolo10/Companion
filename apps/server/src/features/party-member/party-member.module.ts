import { PartyMemberController } from "./party-member.controller";
import { PartyMemberService } from "./party-member.service";

import { Module } from "@nestjs/common";

@Module({
    providers: [PartyMemberService],
    controllers: [PartyMemberController],
})
export class PartyMemberModule {}

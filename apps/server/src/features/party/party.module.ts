import { PartyController } from "@/features/party/party.controller.js";
import { PartyService } from "@/features/party/party.service.js";
import { Module } from "@nestjs/common";

@Module({
    providers: [PartyService],
    controllers: [PartyController],
})
export class PartyModule {}

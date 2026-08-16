import { PartyController } from "@/features/party/party.controller";
import { PartyService } from "@/features/party/party.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [PartyService],
    controllers: [PartyController],
})
export class PartyModule {}

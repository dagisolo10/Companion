import { QuestController } from "@/features/quest/quest.controller.js";
import { QuestService } from "@/features/quest/quest.service.js";
import { Module } from "@nestjs/common";

@Module({
    controllers: [QuestController],
    providers: [QuestService],
})
export class QuestModule {}

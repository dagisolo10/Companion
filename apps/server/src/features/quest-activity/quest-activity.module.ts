import { QuestActivityController } from "@/features/quest-activity/quest-activity.controller.js";
import { QuestActivityService } from "@/features/quest-activity/quest-activity.service.js";
import { Module } from "@nestjs/common";

@Module({
    controllers: [QuestActivityController],
    providers: [QuestActivityService],
})
export class QuestActivityModule {}

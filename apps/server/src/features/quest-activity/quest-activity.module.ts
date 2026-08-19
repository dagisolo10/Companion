import { Module } from "@nestjs/common";
import { QuestActivityService } from "./quest-activity.service";
import { QuestActivityController } from "./quest-activity.controller";

@Module({
    controllers: [QuestActivityController],
    providers: [QuestActivityService],
})
export class QuestActivityModule {}

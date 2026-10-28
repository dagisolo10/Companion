import { QuestActivityService } from "@/features/quest-activity/quest-activity.service.js";
import { Controller, Get, Query } from "@nestjs/common";

@Controller("quest-activity")
export class QuestActivityController {
    constructor(private readonly questActivityService: QuestActivityService) {}

    @Get()
    getMyQuestActivities(@Query("take") take?: string) {
        return this.questActivityService.getMyQuestActivities(take ? parseInt(take) : undefined);
    }
}

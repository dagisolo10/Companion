import { QuestActivityService } from "@/features/quest-activity/quest-activity.service.js";
import { Controller, Get } from "@nestjs/common";

@Controller("quest-activity")
export class QuestActivityController {
    constructor(private readonly questActivityService: QuestActivityService) {}

    @Get()
    getMyQuestActivities() {
        return this.questActivityService.getMyQuestActivities();
    }
}

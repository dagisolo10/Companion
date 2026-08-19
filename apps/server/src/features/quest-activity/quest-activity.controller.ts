import { QuestActivityService } from "./quest-activity.service";

import { Controller, Get } from "@nestjs/common";

@Controller("quest-activity")
export class QuestActivityController {
    constructor(private readonly questActivityService: QuestActivityService) {}

    @Get()
    getMyQuestActivities() {
        return this.questActivityService.getMyQuestActivities();
    }
}

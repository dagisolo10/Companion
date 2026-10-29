import { QuestActivityService } from "@/features/quest-activity/quest-activity.service.js";
import { Controller, Get, Query } from "@nestjs/common";
import { parsePageParams } from "@/common/pagination.js";

@Controller("quest-activity")
export class QuestActivityController {
    constructor(private readonly questActivityService: QuestActivityService) {}

    @Get()
    getMyQuestActivities(@Query("page") page?: string, @Query("limit") limit?: string, @Query("take") take?: string) {
        return this.questActivityService.getMyQuestActivities(parsePageParams(page, limit), take ? Number.parseInt(take, 10) : undefined);
    }
}

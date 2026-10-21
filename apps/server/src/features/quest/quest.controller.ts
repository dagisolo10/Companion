import { CreateQuestDto, type Filter, UpdateQuestDto } from "@/features/quest/quest.dto.js";
import { QuestService } from "@/features/quest/quest.service.js";
import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";

@Controller("quest")
export class QuestController {
    constructor(private readonly questService: QuestService) {}

    @Post()
    createQuest(@Body() data: CreateQuestDto) {
        return this.questService.createQuest(data);
    }

    @Get("my")
    getMyQuests(@Query("status") status?: Filter) {
        return this.questService.getMyQuests(status);
    }

    @Get(":code")
    getQuests(@Param("code") code: string) {
        return this.questService.getPartyQuests(code);
    }

    @Get(":id/:code")
    getQuest(@Param("id") id: string, @Param("code") code: string) {
        return this.questService.getQuest(id, code);
    }

    @Patch(":id")
    updateQuest(@Param("id") id: string, @Body() data: UpdateQuestDto) {
        return this.questService.updateQuest(id, data);
    }

    @Patch(":id/:code/complete")
    completeQuest(@Param("id") id: string, @Param("code") code: string) {
        return this.questService.completeQuest(id, code);
    }
}

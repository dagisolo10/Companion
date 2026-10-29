import { CreateQuestDto, type Filter, UpdateQuestDto } from "@/features/quest/quest.dto.js";
import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { QuestService } from "@/features/quest/quest.service.js";
import { parsePageParams } from "@/common/pagination.js";

@Controller("quest")
export class QuestController {
    constructor(private readonly questService: QuestService) {}

    @Post()
    createQuest(@Body() data: CreateQuestDto) {
        return this.questService.createQuest(data);
    }

    @Get("my")
    getMyQuests(@Query("status") status?: Filter, @Query("take") take?: string, @Query("page") page?: string, @Query("limit") limit?: string) {
        return this.questService.getMyQuests(status, take ? parseInt(take) : undefined, page ? parsePageParams(page, limit) : undefined);
    }

    @Get(":code")
    getPartyQuests(@Param("code") code: string, @Query("status") status?: Filter, @Query("page") page?: string, @Query("limit") limit?: string) {
        return this.questService.getPartyQuests(code, status, page ? parsePageParams(page, limit) : undefined);
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

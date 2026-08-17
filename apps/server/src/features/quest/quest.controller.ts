import { CreateQuestDto } from "./dto/create-quest.dto";
import { UpdateQuestDto } from "./dto/update-quest.dto";
import { QuestService } from "./quest.service";

import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";

@Controller("quest")
export class QuestController {
    constructor(private readonly questService: QuestService) {}

    @Post()
    createQuest(@Body() data: CreateQuestDto) {
        return this.questService.createQuest(data);
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

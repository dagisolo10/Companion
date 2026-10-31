import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "@/features/chat/chat.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { parsePageParams } from "@/common/pagination.js";

@Controller("chat")
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly requestService: RequestService,
    ) {}

    @Get("conversations")
    getConversations() {
        return this.chatService.getConversations(this.requestService.getUserId());
    }

    @Get(":code/messages")
    getMessages(@Param("code") code: string, @Query("page") page?: string, @Query("limit") limit?: string) {
        return this.chatService.getMessages(this.requestService.getUserId(), code, parsePageParams(page, limit));
    }

    @Post(":code/read")
    markRead(@Param("code") code: string) {
        return this.chatService.markRead(this.requestService.getUserId(), code);
    }

    @Get(":code/presence")
    getPresence(@Param("code") code: string) {
        return this.chatService.getPresence(this.requestService.getUserId(), code);
    }
}

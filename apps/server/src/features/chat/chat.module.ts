import { ChatController } from "@/features/chat/chat.controller.js";
import { ChatGateway } from "@/features/chat/chat.gateway.js";
import { ChatService } from "@/features/chat/chat.service.js";
import { Module } from "@nestjs/common";

@Module({
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
})
export class ChatModule {}

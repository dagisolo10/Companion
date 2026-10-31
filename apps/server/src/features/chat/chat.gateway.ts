import type { ChatDeletePayload, ChatDeleteResult, ChatEditPayload, ChatEditResult, ChatReadPayload, ChatReadResult, ChatSendPayload, ChatSendResult, ChatTypingPayload } from "@companion/shared-types";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { HttpException, Logger } from "@nestjs/common";
import { ChatService } from "@/features/chat/chat.service.js";
import type { TypedSocket } from "@/types/socket.io-type.js";

type WirePayload<T> = T | T[] | string;

@WebSocketGateway({ cors: { credentials: true, origin: process.env["CLIENT_URL"] ?? "*" } })
export class ChatGateway {
    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly chatService: ChatService) {}

    private errorMessage(error: unknown) {
        if (error instanceof HttpException) return error.message;
        return error instanceof Error ? error.message : "Something went wrong";
    }

    private normalizePayload<T>(payload: WirePayload<T>): T {
        if (typeof payload === "string") {
            try {
                return JSON.parse(payload) as T;
            } catch {
                return payload as unknown as T;
            }
        }

        if (Array.isArray(payload)) {
            return payload[0] as T;
        }

        return payload;
    }

    @SubscribeMessage("chat:send")
    async send(@ConnectedSocket() client: TypedSocket, @MessageBody() payload: WirePayload<ChatSendPayload>): Promise<ChatSendResult> {
        try {
            const data = this.normalizePayload(payload);
            const message = await this.chatService.sendMessage(client.data.user.id, data);
            return { ok: true, message, clientId: data.clientId };
        } catch (error) {
            const message = this.errorMessage(error);
            this.logger.warn(`chat:send failed for ${client.data.user.id}: ${message}`);
            return { ok: false, error: message };
        }
    }

    @SubscribeMessage("chat:edit")
    async edit(@ConnectedSocket() client: TypedSocket, @MessageBody() payload: WirePayload<ChatEditPayload>): Promise<ChatEditResult> {
        try {
            const message = await this.chatService.editMessage(client.data.user.id, this.normalizePayload(payload));
            return { ok: true, message };
        } catch (error) {
            return { ok: false, error: this.errorMessage(error) };
        }
    }

    @SubscribeMessage("chat:delete")
    async delete(@ConnectedSocket() client: TypedSocket, @MessageBody() payload: WirePayload<ChatDeletePayload>): Promise<ChatDeleteResult> {
        try {
            const result = await this.chatService.deleteMessage(client.data.user.id, this.normalizePayload(payload));
            return { ok: true, ...result };
        } catch (error) {
            return { ok: false, error: this.errorMessage(error) };
        }
    }

    @SubscribeMessage("chat:read")
    async read(@ConnectedSocket() client: TypedSocket, @MessageBody() payload: WirePayload<ChatReadPayload>): Promise<ChatReadResult> {
        try {
            const { lastReadAt } = await this.chatService.markRead(client.data.user.id, this.normalizePayload(payload).partyCode);
            return { ok: true, lastReadAt };
        } catch (error) {
            return { ok: false, error: this.errorMessage(error) };
        }
    }

    @SubscribeMessage("chat:typing")
    async typing(@ConnectedSocket() client: TypedSocket, @MessageBody() payload: WirePayload<ChatTypingPayload>) {
        try {
            await this.chatService.setTyping(client.data.user.id, this.normalizePayload(payload));
        } catch {
            return;
        }
    }
}

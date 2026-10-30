import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import type { TypedServer, TypedSocket } from "@/types/socket.io-type.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { SupabaseService } from "@/common/supabase/supabase.service.js";
import { OnModuleInit } from "@nestjs/common";


@WebSocketGateway({ cors: { credentials: true, origin: process.env["CLIENT_URL"] ?? "*" } })
export class SocketIoGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: TypedServer;

    constructor(
        private readonly supabase: SupabaseService,
        private readonly socketIoService: SocketIoService,
    ) {}

    onModuleInit() {
        this.socketIoService.setServer(this.server);
    }

    async handleConnection(client: TypedSocket) {
        try {
            const token = client.handshake.auth["token"] as string | null;

            if (!token) {
                throw new WsException("Token not provided");
            }

            const { data, error } = await this.supabase.auth.getUser(token);

            if (error || !data.user) {
                throw new WsException("Invalid or expired access token");
            }

            client.data.userId = data.user.id;

            await client.join(data.user.id);

            console.log("✅ Socket Connected!", data.user.user_metadata["name"], client.id);
        } catch (error) {
            client.disconnect();
            console.log("Socket authentication failed", error instanceof Error ? error.message : error);
        }
    }

    async handleDisconnect(client: TypedSocket) {
        if (client.data.userId) {
            await client.leave(client.data.userId);
        }

        console.log("❌ Socket Disconnected!");
    }
}

import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { SocketIoGateway } from "@/common/socket.io/socket.io.gateway.js";
import { PresenceService } from "@/common/socket.io/presence.service.js";
import { Global, Module } from "@nestjs/common";


@Global()
@Module({
    exports: [SocketIoService, PresenceService],
    providers: [SocketIoGateway, SocketIoService, PresenceService],
})
export class SocketIoModule {}

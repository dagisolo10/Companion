import { SocketIoGateway } from "@/config/socket.io/socket.io.gateway";
import { SocketIoService } from "@/config/socket.io/socket.io.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [SocketIoGateway, SocketIoService],
})
export class SocketIoModule {}

import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { SocketIoGateway } from "@/common/socket.io/socket.io.gateway.js";
import { Global, Module } from "@nestjs/common";


@Global()
@Module({
    exports: [SocketIoService],
    providers: [SocketIoGateway, SocketIoService],
})
export class SocketIoModule {}

import { SocketIoService } from "@/config/socket.io/socket.io.service";
import { WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway()
export class SocketIoGateway {
    constructor(private readonly socketIoService: SocketIoService) {}
}

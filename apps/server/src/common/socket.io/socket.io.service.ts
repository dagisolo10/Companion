import { ServerToClientEvents } from "@companion/shared-types";
import { TypedServer } from "@/types/socket.io-type.js";
import { Injectable } from "@nestjs/common";


@Injectable()
export class SocketIoService {
    private server: TypedServer;

    setServer(server: TypedServer) {
        this.server = server;
    }

    emit<Event extends keyof ServerToClientEvents>(event: Event, ...args: Parameters<ServerToClientEvents[Event]>) {
        this.server.emit(event, ...args);
    }

    emitTo<Event extends keyof ServerToClientEvents>(event: Event, to: string, ...args: Parameters<ServerToClientEvents[Event]>) {
        this.server.to(to).emit(event, ...args);
    }

    emitToUsers<Event extends keyof ServerToClientEvents>(event: Event, userIds: string[], ...args: Parameters<ServerToClientEvents[Event]>) {
        if (userIds.length === 0) return;
        this.server.to(userIds).emit(event, ...args);
    }
}

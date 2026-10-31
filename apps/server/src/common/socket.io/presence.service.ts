import { Injectable } from "@nestjs/common";

@Injectable()
export class PresenceService {
    private readonly connections = new Map<string, Set<string>>();

    add(userId: string, socketId: string) {
        const sockets = this.connections.get(userId) ?? new Set<string>();
        sockets.add(socketId);
        this.connections.set(userId, sockets);

        return sockets.size === 1;
    }

    remove(userId: string, socketId: string) {
        const sockets = this.connections.get(userId);

        if (!sockets) return true;

        sockets.delete(socketId);

        if (sockets.size === 0) {
            this.connections.delete(userId);
            return true;
        }

        return false;
    }

    filterOnline(userIds: string[]) {
        return userIds.filter((userId) => this.connections.has(userId));
    }
}

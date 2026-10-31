import { DevAuthService } from "@/common/auth/dev-auth.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PresenceService } from "@/common/socket.io/presence.service.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { SupabaseService } from "@/common/supabase/supabase.service.js";
import type { TypedServer, TypedSocket } from "@/types/socket.io-type.js";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from "@nestjs/websockets";
import type { User } from "@supabase/supabase-js";

const AUTH_VALIDATION_RETRY_DELAYS_MS = [250, 500] as const;

function isTransientAuthFailure(error: unknown): boolean {
    if (typeof error !== "object" || error === null || !("status" in error)) return false;

    const status = error.status;
    return status === undefined || status === 0 || status === 408 || status === 425 || status === 429 || (typeof status === "number" && status >= 500);
}

function delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

@WebSocketGateway({ cors: { credentials: true, origin: process.env["CLIENT_URL"] ?? "*" } })
export class SocketIoGateway implements OnGatewayInit<TypedServer>, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly prisma: PrismaService,
        private readonly devAuth: DevAuthService,
        private readonly supabase: SupabaseService,
        private readonly socketIoService: SocketIoService,
        private readonly presenceService: PresenceService,
    ) {}

    afterInit(server: TypedServer) {
        this.socketIoService.setServer(server);
        server.use((client, next) => {
            void this.authenticate(client).then(
                () => next(),
                (error: unknown) => {
                    console.log("Socket authentication failed", error instanceof Error ? error.message : error);
                    next(error instanceof Error ? error : new Error("Socket authentication failed"));
                },
            );
        });
    }

    private getToken(client: TypedSocket) {
        const authToken = client.handshake.auth["token"];
        if (typeof authToken === "string" && authToken) return this.normalizeToken(authToken);

        const queryToken = client.handshake.query["token"];
        if (typeof queryToken === "string" && queryToken) return this.normalizeToken(queryToken);

        const header = client.handshake.headers.authorization;
        if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();

        const tokenHeader = client.handshake.headers.token;
        if (typeof tokenHeader === "string" && tokenHeader) return this.normalizeToken(tokenHeader);

        return undefined;
    }

    private normalizeToken(token: string) {
        return token.startsWith("Bearer ") ? token.slice("Bearer ".length).trim() : token.trim();
    }

    private async authenticate(client: TypedSocket): Promise<void> {
        const token = this.getToken(client);
        if (!token) {
            throw new Error("Token not provided");
        }

        const devUser = await this.devAuth.resolve(token);
        if (devUser) {
            client.data.user = this.devAuth.toSupabaseUser(devUser);
            return;
        }

        let user: User | null = null;
        for (let attempt = 0; attempt <= AUTH_VALIDATION_RETRY_DELAYS_MS.length; attempt++) {
            let validationError: unknown;
            try {
                const { data, error } = await this.supabase.auth.getUser(token);
                if (data.user && !error) {
                    user = data.user;
                } else {
                    validationError = error ?? new Error("User not found");
                }
            } catch (error) {
                validationError = error;
            }
            if (user) break;
            if (!isTransientAuthFailure(validationError)) {
                throw new Error("Invalid or expired access token");
            }
            if (attempt === AUTH_VALIDATION_RETRY_DELAYS_MS.length) {
                throw new Error("Authentication service temporarily unavailable");
            }
            const retryDelay = AUTH_VALIDATION_RETRY_DELAYS_MS[attempt];
            if (retryDelay !== undefined) {
                await delay(retryDelay);
            }
        }
        if (!user) {
            throw new Error("Invalid or expired access token");
        }
        client.data.user = user;
    }

    async handleConnection(client: TypedSocket) {
        await client.join(client.data.user.id);
        this.presenceService.add(client.data.user.id, client.id);
        await this.broadcastPresence(client.data.user.id);
        console.log("✅ Socket Connected!", client.data.user.user_metadata["name"]);
    }

    async handleDisconnect(client: TypedSocket) {
        const user = client.data.user;
        if (!user) return;

        await client.leave(user.id);
        const wentOffline = this.presenceService.remove(user.id, client.id);
        if (wentOffline) await this.broadcastPresence(user.id);
        console.log("❌ Socket Disconnected!", user.user_metadata["name"]);
    }

    private async broadcastPresence(userId: string) {
        try {
            const memberships = await this.prisma.partyMember.findMany({
                where: { userId },
                select: { party: { select: { code: true, members: { select: { userId: true } } } } },
            });

            for (const { party } of memberships) {
                const memberIds = party.members.map(({ userId }) => userId);
                this.socketIoService.emitToUsers("chat:presence", memberIds, {
                    partyCode: party.code,
                    onlineUserIds: this.presenceService.filterOnline(memberIds),
                });
            }
        } catch (error) {
            console.log("Presence broadcast failed", error instanceof Error ? error.message : error);
        }
    }
}

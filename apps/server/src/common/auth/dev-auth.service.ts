import { PrismaService } from "@/common/prisma/prisma.service.js";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { User } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const SKIP_AUTH_PATTERN = /^skip[-_ ]?auth(?::(.*))?$/i;

type DevUser = {
    id: string;
    name: string;
    username: string;
};

@Injectable()
export class DevAuthService {
    private readonly logger = new Logger(DevAuthService.name);
    private readonly enabled: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const flag = this.configService.get<string>("DEV_AUTH_ENABLED")?.trim().toLowerCase();
        const environment = this.configService.get<string>("NODE_ENV")?.trim().toLowerCase();

        this.enabled = flag === "true" && environment !== "production";

        if (this.enabled) {
            this.logger.warn("DEV_AUTH_ENABLED is on. Tokens like 'skip-auth' bypass Supabase authentication. Never enable this in production.");
        }
    }

    async resolve(token: string): Promise<DevUser | null> {
        if (!this.enabled) return null;

        const match = SKIP_AUTH_PATTERN.exec(token.trim());
        if (!match) return null;

        const identifier = match[1]?.trim();

        if (!identifier) return this.ensureDefaultUser();

        return this.ensureUser(identifier);
    }

    toSupabaseUser(user: DevUser): User {
        return {
            id: user.id,
            email: `${user.username}@dev.local`,
            user_metadata: { name: user.name, username: user.username },
        } as unknown as User;
    }

    private async ensureDefaultUser() {
        const id = this.configService.get<string>("DEV_AUTH_USER_ID")?.trim() || undefined;
        const name = this.configService.get<string>("DEV_AUTH_USER_NAME")?.trim() || "Postman Dev";
        const username = this.configService.get<string>("DEV_AUTH_USER_USERNAME")?.trim() || "postman_dev";

        return this.ensureUser(username, { id, name });
    }

    private async ensureUser(identifier: string, options: { id?: string; name?: string } = {}): Promise<DevUser> {
        const username = this.slugifyUsername(identifier);

        if (!username) {
            throw new Error("Dev auth username cannot be empty");
        }

        const existing = await this.findUser(identifier, username, options.id);
        if (existing) return existing;

        try {
            return await this.prisma.user.create({
                data: {
                    id: options.id ?? randomUUID(),
                    name: options.name ?? identifier,
                    username,
                },
                select: { id: true, name: true, username: true },
            });
        } catch (error) {
            const raced = await this.findUser(identifier, username, options.id);
            if (raced) return raced;
            throw error;
        }
    }

    private findUser(identifier: string, username: string, id?: string) {
        const identifiers = [...new Set([id, identifier, username].filter((value): value is string => Boolean(value)))];

        return this.prisma.user.findFirst({
            where: { OR: identifiers.flatMap((value) => [{ id: value }, { username: value }]) },
            select: { id: true, name: true, username: true },
        });
    }

    private slugifyUsername(username: string) {
        return username
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^\w-]/g, "");
    }
}

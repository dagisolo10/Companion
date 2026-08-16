import { RequestService } from "@/config/request/request.service";
import { SupabaseService } from "@/config/supabase/supabase.service";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly supabase: SupabaseService,
        private readonly requestService: RequestService,
    ) {}

    async use(req: Request, _res: Response, next: NextFunction) {
        const isDevelopment = !false;

        let supabaseUserId: string | null = null;

        if (!isDevelopment) {
            const header = req.headers.authorization;

            if (!header || !header.startsWith("Bearer ")) {
                throw new UnauthorizedException("Unauthorized. Missing token");
            }

            const token = header.split(" ")[1];

            const { data, error } = await this.supabase.auth.getUser(token);

            if (error || !data.user) {
                throw new UnauthorizedException("Unauthorized. Invalid session token");
            }

            supabaseUserId = data.user.id;
        }

        const userId = isDevelopment ? (req.headers["userid"] as string) : supabaseUserId;

        if (!userId) {
            throw new UnauthorizedException(isDevelopment ? "userId header is required" : "Unauthorized. Login First");
        }

        this.requestService.setUserId(userId);

        next();
    }
}

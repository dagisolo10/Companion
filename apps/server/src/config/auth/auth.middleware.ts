import { RequestService } from "@/config/request/request.service";
import { SupabaseService } from "@/config/supabase/supabase.service";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly requestService: RequestService,
        private readonly supabaseService: SupabaseService,
    ) {}

    async use(req: Request, _res: Response, next: NextFunction) {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            throw new UnauthorizedException("Unauthorized. Missing token");
        }

        const token = header.split(" ")[1];

        const { data, error } = await this.supabaseService.supabase.auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedException("Unauthorized. Invalid session token");
        }

        this.requestService.setUserId(data.user.id);

        next();
    }
}

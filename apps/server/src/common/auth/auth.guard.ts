import { IS_PUBLIC_KEY } from "@/common/auth/public.decorator.js";
import { DevAuthService } from "@/common/auth/dev-auth.service.js";
import { SupabaseService } from "@/common/supabase/supabase.service.js";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly supabase: SupabaseService,
        private readonly devAuth: DevAuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() === "ws") {
            return true;
        }

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const header = request.headers.authorization;
        const tokenHeader = request.headers.token;
        const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : typeof tokenHeader === "string" ? tokenHeader.trim() : undefined;

        if (!token) {
            throw new UnauthorizedException("Unauthorized. Missing token");
        }

        const devUser = await this.devAuth.resolve(token).catch((error: unknown) => {
            throw new UnauthorizedException(error instanceof Error ? error.message : "Invalid dev auth user");
        });

        if (devUser) {
            request.userId = devUser.id;
            return true;
        }

        const { data, error } = await this.supabase.auth.getUser(token);

        if (error || !data.user) {
            throw new UnauthorizedException("Unauthorized. Invalid session token");
        }

        request.userId = data.user.id;

        return true;
    }
}

import { IS_PUBLIC_KEY } from "@/config/auth/auth.decorator";
import { SupabaseService } from "@/config/supabase/supabase.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly supabase: SupabaseService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        const dev = false;
        let supabaseUserId: string | null = null;

        const request = context.switchToHttp().getRequest<Request>();

        if (!dev) {
            const header = request.headers.authorization;

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

        const userId = dev ? (request.headers["userid"] as string) : supabaseUserId;

        if (!userId) {
            throw new UnauthorizedException(dev ? "userId header is required" : "Unauthorized. Login First");
        }

        request.userId = userId;

        return true;
    }
}

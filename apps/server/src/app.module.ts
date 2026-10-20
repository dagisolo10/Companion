import { AppController } from "@/app.controller.js";
import { PrismaModule } from "@/config/prisma/prisma.module.js";
import { RequestModule } from "@/config/request/request.module.js";
import { SupabaseModule } from "@/config/supabase/supabase.module.js";
import { UserModule } from "@/features/user/user.module.js";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { AuthGuard } from "./config/auth/auth.guard.js";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), SupabaseModule, RequestModule, PrismaModule, UserModule],
    controllers: [AppController],
    providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}

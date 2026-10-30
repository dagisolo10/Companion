import { QuestActivityModule } from "@/features/quest-activity/quest-activity.module.js";
import { PartyMemberModule } from "@/features/party-member/party-member.module.js";
import { DashboardModule } from "@/features/dashboard/dashboard.module.js";
import { SocketIoModule } from "@/common/socket.io/socket.io.module.js";
import { SupabaseModule } from "@/common/supabase/supabase.module.js";
import { RequestModule } from "@/common/request/request.module.js";
import { StreakModule } from "@/features/streak/streak.module.js";
import { PrismaModule } from "@/common/prisma/prisma.module.js";
import { QuestModule } from "@/features/quest/quest.module.js";
import { PartyModule } from "@/features/party/party.module.js";
import { UserModule } from "@/features/user/user.module.js";
import { AuthGuard } from "@/common/auth/auth.guard.js";
import { AppController } from "@/app.controller.js";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";


@Module({
    imports: [SupabaseModule, RequestModule, ConfigModule.forRoot({ isGlobal: true }), UserModule, PrismaModule, PartyModule, PartyMemberModule, QuestModule, QuestActivityModule, DashboardModule, StreakModule, SocketIoModule],
    providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    controllers: [AppController],
})
export class AppModule {}

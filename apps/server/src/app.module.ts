import { AppController } from "@/app.controller";
import { AuthGuard } from "@/config/auth/auth.guard";
import { PrismaModule } from "@/config/prisma/prisma.module";
import { RequestModule } from "@/config/request/request.module";
import { SocketIoModule } from "@/config/socket.io/socket.io.module";
import { SupabaseModule } from "@/config/supabase/supabase.module";
import { PartyMemberModule } from "@/features/party-member/party-member.module";
import { PartyModule } from "@/features/party/party.module";
import { QuestModule } from "@/features/quest/quest.module";
import { UserModule } from "@/features/user/user.module";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [SupabaseModule, SocketIoModule, RequestModule, ConfigModule.forRoot({ isGlobal: true }), UserModule, PrismaModule, PartyModule, PartyMemberModule, QuestModule],
    providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    controllers: [AppController],
})
export class AppModule {}

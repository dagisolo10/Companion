import { AuthMiddleware } from "@/config/auth/auth.middleware";
import { PrismaModule } from "@/config/prisma/prisma.module";
import { RequestModule } from "@/config/request/request.module";
import { SocketIoModule } from "@/config/socket.io/socket.io.module";
import { SupabaseModule } from "@/config/supabase/supabase.module";
import { PartyMemberModule } from "@/features/party-member/party-member.module";
import { PartyModule } from "@/features/party/party.module";
import { QuestModule } from "@/features/quest/quest.module";
import { UserModule } from "@/features/user/user.module";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [SupabaseModule, SocketIoModule, RequestModule, ConfigModule.forRoot({ isGlobal: true }), UserModule, PrismaModule, PartyModule, PartyMemberModule, QuestModule],
    providers: [],
    controllers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes("*");
    }
}

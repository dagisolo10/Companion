import { SocketIoModule } from "@/config/socket.io/socket.io.module";
import { SupabaseModule } from "@/config/supabase/supabase.module";
import { Module } from "@nestjs/common";

@Module({
    imports: [SupabaseModule, SocketIoModule],
    providers: [],
    controllers: [],
})
export class AppModule {}

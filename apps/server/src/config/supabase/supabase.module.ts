import { SupabaseService } from "@/config/supabase/supabase.service";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [SupabaseService],
    providers: [SupabaseService],
})
export class SupabaseModule {}

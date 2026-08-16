import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService extends SupabaseClient {
    // supabase: SupabaseClient;

    constructor(configService: ConfigService) {
        const supabaseUrl = configService.getOrThrow<string>("SUPABASE_URL");
        const supabaseKey = configService.getOrThrow<string>("SUPABASE_SECRET_KEY");

        super(supabaseUrl, supabaseKey);
    }
}

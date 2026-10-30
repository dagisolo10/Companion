import { SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";


@Injectable()
export class SupabaseService extends SupabaseClient {
    constructor(configService: ConfigService) {
        const supabaseUrl = configService.getOrThrow<string>("SUPABASE_URL");
        const supabaseKey = configService.getOrThrow<string>("SUPABASE_SECRET_KEY");

        super(supabaseUrl, supabaseKey);
    }
}

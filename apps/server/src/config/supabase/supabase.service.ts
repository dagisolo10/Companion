import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
    supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.getOrThrow<string>("SUPABASE_URL");
        const supabaseKey = this.configService.getOrThrow<string>("SUPABASE_SECRET_KEY");

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
}

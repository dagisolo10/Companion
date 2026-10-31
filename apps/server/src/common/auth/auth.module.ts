import { DevAuthService } from "@/common/auth/dev-auth.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [DevAuthService],
    providers: [DevAuthService],
})
export class AuthModule {}

import { StreakService } from "@/features/streak/streak.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    providers: [StreakService],
    exports: [StreakService],
})
export class StreakModule {}

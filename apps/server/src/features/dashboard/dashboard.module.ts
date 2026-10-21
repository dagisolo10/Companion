import { DashboardController } from "@/features/dashboard/dashboard.controller.js";
import { DashboardService } from "@/features/dashboard/dashboard.service.js";
import { Module } from "@nestjs/common";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}

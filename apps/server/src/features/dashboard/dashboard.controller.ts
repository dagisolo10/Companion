import { DashboardService } from "@/features/dashboard/dashboard.service.js";
import { Controller, Get } from "@nestjs/common";

@Controller("dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    getDashboard() {
        return this.dashboardService.getDashboard();
    }
}

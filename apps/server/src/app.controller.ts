import { Public } from "@/common/auth/public.decorator.js";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Public()
    @Get()
    hello() {
        return {
            text: "Nest API working 🟢",
            timestamp: new Date().toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            }),
        };
    }
}

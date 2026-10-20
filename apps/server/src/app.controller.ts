import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Get()
    hello() {
        return {
            text: "Nest Api working 🟢",
            timestamp: new Date().toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            }),
        };
    }
}

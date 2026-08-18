import { Controller, Get } from "@nestjs/common";

@Controller("app")
export class AppController {
    @Get("hello")
    hello() {
        return { text: "Nest Api working 🟢", timestamp: Date.now() };
    }
}

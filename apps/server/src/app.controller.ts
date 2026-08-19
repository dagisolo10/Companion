import { Controller, Get } from "@nestjs/common";

@Controller("app")
export class AppController {
    @Get("hello")
    hello() {
        return { text: "Nest Api working 🟢", timestamp: new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", second: "numeric" }) };
    }
}

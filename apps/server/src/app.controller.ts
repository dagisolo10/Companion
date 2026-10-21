import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Get("hello")
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

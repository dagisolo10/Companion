import { RequestService } from "@/common/request/request.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [RequestService],
    providers: [RequestService],
})
export class RequestModule {}

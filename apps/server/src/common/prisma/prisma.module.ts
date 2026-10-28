import { PrismaService } from "@/common/prisma/prisma.service.js";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
    exports: [PrismaService],
    providers: [PrismaService],
})
export class PrismaModule {}

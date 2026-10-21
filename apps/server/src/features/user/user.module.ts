import { UserController } from "@/features/user/user.controller.js";
import { UserService } from "@/features/user/user.service.js";
import { Module } from "@nestjs/common";

@Module({
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}

import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getMe() {
        return this.userService.getMe();
    }

    @Get(":username")
    findUser(@Param("username") username: string) {
        return this.userService.findUser(username);
    }

    @Patch()
    updateAccount(@Body() data: UpdateUserDto) {
        return this.userService.updateAccount(data);
    }

    @Delete("")
    deleteAccount() {
        return this.userService.deleteAccount();
    }
}

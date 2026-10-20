import { Public } from "@/config/auth/auth.decorator.js";
import { UpdateUserDto } from "@/features/user/user.dto.js";
import { UserService } from "@/features/user/user.service.js";
import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getOrCreateUser() {
        return this.userService.getOrCreateUser();
    }

    @Public()
    @Get("username/:username")
    isUsernameAvailable(@Param("username") username: string) {
        return this.userService.isUsernameAvailable(username);
    }

    @Get(":username")
    searchUser(@Param("username") username: string) {
        return this.userService.searchUser(username);
    }

    @Patch()
    updateAccount(@Body() data: UpdateUserDto) {
        return this.userService.updateAccount(data);
    }

    @Delete()
    deleteAccount() {
        return this.userService.deleteAccount();
    }
}

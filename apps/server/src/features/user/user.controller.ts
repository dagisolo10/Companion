import { Public } from "@/common/auth/public.decorator.js";
import { UpdateUserDto } from "@/features/user/user.dto.js";
import { UserService } from "@/features/user/user.service.js";
import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { parsePageParams } from "@/common/pagination.js";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getMe() {
        return this.userService.getMe();
    }

    @Public()
    @Get("username/:username")
    isUsernameAvailable(@Param("username") username: string) {
        return this.userService.isUsernameAvailable(username);
    }

    @Get("leaderboard")
    getLeaderboard(@Query("limit") take?: string) {
        return this.userService.getLeaderboard(take ? parseInt(take) : undefined);
    }

    @Get("search")
    searchUsers(@Query("query") query: string, @Query("page") page?: string, @Query("limit") limit?: string) {
        return this.userService.searchUsers(query, page ? parsePageParams(page, limit) : undefined);
    }

    @Get(":username")
    findUser(@Param("username") username: string) {
        return this.userService.findUser(username);
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

import { PrismaService } from "@/config/prisma/prisma.service";
import { RequestService } from "@/config/request/request.service";
import { SupabaseService } from "@/config/supabase/supabase.service";
import { UpdateUserDto } from "@/features/user/dto/user.dto";
import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabase: SupabaseService,
        private readonly requestService: RequestService,
    ) {}

    async isUsernameAvailable(username: string) {
        const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
        console.log("isUsernameAvailable", !user);
        return !user;
    }

    async getMe() {
        try {
            const id = this.requestService.getUserId();

            let user = await this.prisma.user.findUnique({ where: { id } });

            if (!user) {
                const { data, error } = await this.supabase.auth.admin.getUserById(id);

                const supabaseUser = data.user;

                if (error || !supabaseUser) {
                    throw new NotFoundException("User not found in authentication system");
                }

                const userMetadata = supabaseUser.user_metadata;
                const name = (userMetadata["name"] as string) || "User";
                const username = (userMetadata["username"] as string) || "username";

                user = await this.prisma.user.upsert({
                    where: { id },
                    update: { name },
                    create: {
                        id,
                        name,
                        username,
                    },
                });
            }

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new ConflictException("Username is already taken");
            }

            throw error;
        }
    }

    async findUser(username: string) {
        const user = await this.prisma.user.findUnique({ where: { username } });

        if (!user) {
            throw new NotFoundException("User not found. Try another username");
        }

        return user;
    }

    async updateAccount(data: UpdateUserDto) {
        try {
            const id = this.requestService.getUserId();

            const user = await this.prisma.user.findUnique({ where: { id } });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const updatedUser = await this.prisma.user.update({ where: { id }, data });

            await this.supabase.auth.updateUser({ data: { name: data.name, username: data.username } });

            return updatedUser;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new BadRequestException("Username already taken. Choose another one");
            }
        }
    }

    async deleteAccount() {
        const id = this.requestService.getUserId();

        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        await this.prisma.user.delete({ where: { id } });

        await this.supabase.auth.admin.deleteUser(id);

        return { success: true };
    }
}

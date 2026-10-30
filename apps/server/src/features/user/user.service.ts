import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { SupabaseService } from "@/common/supabase/supabase.service.js";
import { RequestService } from "@/common/request/request.service.js";
import { StreakService } from "@/features/streak/streak.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
import { UpdateUserDto } from "@/features/user/user.dto.js";
import { Prisma } from "@prisma/client";


@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly supabase: SupabaseService,
        private readonly streakService: StreakService,
        private readonly requestService: RequestService,
        private readonly socketIoService: SocketIoService,
    ) {}

    async getLeaderboard(take = 100) {
        const users = await this.prisma.user.findMany({ take, orderBy: { experience: "desc" }, where: { public: true } });

        return await this.streakService.resolveStreaks(users);
    }

    async isUsernameAvailable(username: string) {
        const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
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
                const rawUsername = (userMetadata["username"] as string) || "username";

                const username = this.slugifyUsername(rawUsername);

                const existingUserWithUsername = await this.prisma.user.findUnique({ where: { username } });

                if (existingUserWithUsername) {
                    throw new ConflictException("Username is already taken");
                }

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

            const [resolved] = await this.streakService.resolveStreaks([user]);

            return resolved;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new ConflictException("Username is already taken");
            }

            throw error;
        }
    }

    async searchUsers(query: string, page?: PageParams) {
        const trimmed = query.trim();

        if (trimmed.length < 2) {
            return page ? { items: [], nextPage: null, hasMore: false } : [];
        }

        const findUsers = ({ skip, take }: { skip?: number; take?: number }) =>
            this.prisma.user.findMany({
                where: {
                    AND: [{ public: true }, { OR: [{ username: { contains: trimmed, mode: "insensitive" } }, { name: { contains: trimmed, mode: "insensitive" } }] }],
                },
                ...(skip !== undefined && { skip }),
                ...(take !== undefined && { take }),
                orderBy: [{ username: "asc" }, { id: "asc" }],
            });

        return page ? paginate(page, ({ skip, take }) => findUsers({ skip, take })) : findUsers({ take: 20 });
    }

    async findUser(username: string) {
        const user = await this.prisma.user.findUnique({ where: { username } });

        if (!user || !user.public) {
            throw new NotFoundException("User not found. Try another username");
        }

        const [resolved] = await this.streakService.resolveStreaks([user]);

        return resolved;
    }

    async updateAccount(data: UpdateUserDto) {
        try {
            const id = this.requestService.getUserId();
            const { name, public: isPublic, username } = data;

            const user = await this.prisma.user.findUnique({ where: { id } });

            if (!user) {
                throw new NotFoundException("User not found");
            }

            const slugUsername = username ? this.slugifyUsername(username) : undefined;

            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    name,
                    public: isPublic,
                    username: slugUsername,
                },
            });

            if (name !== undefined || slugUsername !== undefined) {
                await this.supabase.auth.admin.updateUserById(id, { user_metadata: { name, username: slugUsername } });
            }

            const [resolved] = await this.streakService.resolveStreaks([updatedUser]);

            if (name !== undefined || slugUsername !== undefined) await this.notifyProfileUpdated(resolved);

            return resolved;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new BadRequestException("Username already taken. Choose another one");
            }
            throw error;
        }
    }

    private async notifyProfileUpdated(user: Prisma.UserGetPayload<{}>) {
        try {
            const memberships = await this.prisma.partyMember.findMany({ where: { userId: user.id }, select: { partyId: true, party: { select: { code: true } } } });
            if (memberships.length === 0) return;

            const partyIds = [...new Set(memberships.map(({ partyId }) => partyId))];
            const partyMembers = await this.prisma.partyMember.findMany({ where: { partyId: { in: partyIds } }, select: { userId: true } });
            this.socketIoService.emitToUsers("user:updated", [...new Set(partyMembers.map(({ userId }) => userId))], { user: { ...user, createdAt: user.createdAt.toISOString() } });

            await Promise.all(
                memberships.map(async ({ partyId, party }) => {
                    const leaderboard = await this.streakService.buildLeaderboardPayload(partyId);
                    const recipients = leaderboard.map(({ userId }) => userId);
                    this.socketIoService.emitToUsers("party:leaderboard-updated", recipients, { partyCode: party.code, leaderboard });
                }),
            );
        } catch (error) {
            this.logger.warn(`Profile update broadcast failed: ${String(error)}`);
        }
    }

    async deleteAccount() {
        const id = this.requestService.getUserId();

        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const { error } = await this.supabase.auth.admin.deleteUser(id);

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        await this.prisma.user.delete({ where: { id } });

        return { success: true };
    }

    private slugifyUsername(username: string) {
        return username
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^\w-]/g, "");
    }
}

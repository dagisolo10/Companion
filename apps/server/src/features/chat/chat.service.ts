import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { ChatMessage } from "@companion/shared-types";
import { PresenceService } from "@/common/socket.io/presence.service.js";
import { SocketIoService } from "@/common/socket.io/socket.io.service.js";
import { PrismaService } from "@/common/prisma/prisma.service.js";
import { PageParams, paginate } from "@/common/pagination.js";
import { Prisma } from "@prisma/client";

const MAX_MESSAGE_LENGTH = 2000;

const chatMessageInclude = {
    sender: {
        select: {
            id: true,
            name: true,
            username: true,
        },
    },
} satisfies Prisma.ChatMessageInclude;

type ChatMessageRecord = Prisma.ChatMessageGetPayload<{ include: typeof chatMessageInclude }>;

@Injectable()
export class ChatService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly socketIoService: SocketIoService,
        private readonly presenceService: PresenceService,
    ) {}

    private serializeMessage(message: ChatMessageRecord): ChatMessage {
        return {
            id: message.id,
            partyId: message.partyId,
            senderId: message.senderId,
            content: message.content,
            editedAt: message.editedAt?.toISOString() ?? null,
            createdAt: message.createdAt.toISOString(),
            sender: message.sender,
        };
    }

    private async getPartyWithMembers(code: string) {
        const party = await this.prisma.party.findUnique({
            where: { code },
            select: {
                id: true,
                code: true,
                name: true,
                members: { select: { userId: true } },
            },
        });

        if (!party) {
            throw new NotFoundException("Party not found");
        }

        return party;
    }

    private assertMember(members: { userId: string }[], userId: string) {
        if (!members.some((member) => member.userId === userId)) {
            throw new ForbiddenException("You are not a member of this party");
        }
    }

    private memberIds(party: { members: { userId: string }[] }) {
        return party.members.map((member) => member.userId);
    }

    private normalizeContent(content: string) {
        const trimmed = content.trim();

        if (!trimmed) {
            throw new BadRequestException("Message cannot be empty");
        }

        if (trimmed.length > MAX_MESSAGE_LENGTH) {
            throw new BadRequestException(`Message cannot be longer than ${MAX_MESSAGE_LENGTH} characters`);
        }

        return trimmed;
    }

    async getConversations(userId: string) {
        const parties = await this.prisma.party.findMany({
            where: { members: { some: { userId } } },
            include: {
                _count: { select: { members: true } },
                chatReads: { where: { userId }, select: { lastReadAt: true } },
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });

        const conversations = await Promise.all(
            parties.map(async (party) => {
                const lastReadAt = party.chatReads[0]?.lastReadAt ?? null;
                const [lastMessage, unreadCount] = await Promise.all([
                    this.prisma.chatMessage.findFirst({
                        where: { partyId: party.id },
                        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                        include: chatMessageInclude,
                    }),
                    this.prisma.chatMessage.count({
                        where: {
                            partyId: party.id,
                            senderId: { not: userId },
                            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
                        },
                    }),
                ]);

                return {
                    party: {
                        id: party.id,
                        code: party.code,
                        name: party.name,
                        public: party.public,
                        createdAt: party.createdAt.toISOString(),
                        creatorId: party.creatorId,
                        _count: party._count,
                        isMember: true,
                    },
                    lastMessage: lastMessage ? this.serializeMessage(lastMessage) : null,
                    unreadCount,
                    lastReadAt: lastReadAt?.toISOString() ?? null,
                };
            }),
        );

        return conversations.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt ?? a.party.createdAt;
            const bTime = b.lastMessage?.createdAt ?? b.party.createdAt;
            return bTime.localeCompare(aTime);
        });
    }

    async getMessages(userId: string, code: string, page: PageParams) {
        const party = await this.getPartyWithMembers(code);
        this.assertMember(party.members, userId);

        return paginate(page, async ({ skip, take }) => {
            const messages = await this.prisma.chatMessage.findMany({
                where: { partyId: party.id },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip,
                take,
                include: chatMessageInclude,
            });

            return messages.map((message) => this.serializeMessage(message));
        });
    }

    async markRead(userId: string, code: string) {
        const party = await this.getPartyWithMembers(code);
        this.assertMember(party.members, userId);

        const lastReadAt = new Date();
        await this.prisma.partyChatRead.upsert({
            where: { partyId_userId: { partyId: party.id, userId } },
            create: { partyId: party.id, userId, lastReadAt },
            update: { lastReadAt },
        });

        const event = { partyCode: party.code, userId, lastReadAt: lastReadAt.toISOString() };
        this.socketIoService.emitToUsers("chat:read", [userId], event);

        return event;
    }

    async getPresence(userId: string, code: string) {
        const party = await this.getPartyWithMembers(code);
        this.assertMember(party.members, userId);

        return {
            partyCode: party.code,
            onlineUserIds: this.presenceService.filterOnline(this.memberIds(party)),
        };
    }

    async sendMessage(userId: string, { partyCode, content, clientId }: { partyCode: string; content: string; clientId: string }) {
        const party = await this.getPartyWithMembers(partyCode);
        this.assertMember(party.members, userId);

        const message = await this.prisma.chatMessage.create({
            data: {
                partyId: party.id,
                senderId: userId,
                content: this.normalizeContent(content),
            },
            include: chatMessageInclude,
        });

        const serialized = this.serializeMessage(message);
        this.socketIoService.emitToUsers("chat:message", this.memberIds(party), {
            partyCode: party.code,
            message: serialized,
            clientId,
        });

        return serialized;
    }

    async editMessage(userId: string, { messageId, content }: { messageId: string; content: string }) {
        const message = await this.prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                ...chatMessageInclude,
                party: { select: { code: true, members: { select: { userId: true } } } },
            },
        });

        if (!message) {
            throw new NotFoundException("Message not found");
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException("You can only edit your own messages");
        }

        const updated = await this.prisma.chatMessage.update({
            where: { id: messageId },
            data: { content: this.normalizeContent(content), editedAt: new Date() },
            include: chatMessageInclude,
        });

        const serialized = this.serializeMessage(updated);
        this.socketIoService.emitToUsers("chat:message-updated", this.memberIds(message.party), {
            partyCode: message.party.code,
            message: serialized,
        });

        return serialized;
    }

    async deleteMessage(userId: string, { messageId }: { messageId: string }) {
        const message = await this.prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: { party: { select: { id: true, code: true, members: { select: { userId: true } } } } },
        });

        if (!message) {
            throw new NotFoundException("Message not found");
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException("You can only delete your own messages");
        }

        await this.prisma.chatMessage.delete({ where: { id: messageId } });

        this.socketIoService.emitToUsers("chat:message-deleted", this.memberIds(message.party), {
            partyId: message.party.id,
            partyCode: message.party.code,
            messageId,
        });

        return { messageId, partyCode: message.party.code };
    }

    async setTyping(userId: string, { partyCode, isTyping }: { partyCode: string; isTyping: boolean }) {
        const party = await this.getPartyWithMembers(partyCode);
        this.assertMember(party.members, userId);

        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const recipients = this.memberIds(party).filter((memberId) => memberId !== userId);

        this.socketIoService.emitToUsers("chat:typing", recipients, {
            partyCode: party.code,
            userId,
            name: user?.name ?? "Someone",
            isTyping,
        });
    }
}

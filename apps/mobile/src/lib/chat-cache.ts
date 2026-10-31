import type { ChatConversation, ChatMessage, ChatPresence, Party, PartyDetail } from "@companion/shared-types";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/response";
import { queryKeys } from "@/constants/query-keys";

type ChatPages = InfiniteData<PaginatedResult<ChatMessage>>;

function sortConversations(conversations: ChatConversation[]) {
    return [...conversations].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? a.party.createdAt;
        const bTime = b.lastMessage?.createdAt ?? b.party.createdAt;
        return bTime.localeCompare(aTime);
    });
}

export function upsertConversation(queryClient: QueryClient, party: PartyDetail) {
    queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.conversations(), (conversations) => {
        if (!conversations) return conversations;

        if (conversations.some((conversation) => conversation.party.code === party.code)) {
            return sortConversations(conversations.map((conversation) => (conversation.party.code === party.code ? { ...conversation, party } : conversation)));
        }

        return sortConversations([...conversations, { party, lastMessage: null, unreadCount: 0, lastReadAt: null }]);
    });
}

export function removeChatCaches(queryClient: QueryClient, partyCode: string) {
    queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.conversations(), (conversations) => conversations?.filter((conversation) => conversation.party.code !== partyCode));
    queryClient.removeQueries({ queryKey: queryKeys.chat.presence(partyCode) });
    queryClient.removeQueries({ queryKey: ["paginated", ...queryKeys.chat.messages(partyCode)] });
}

export function updateConversationParty(queryClient: QueryClient, party: Party) {
    queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.conversations(), (conversations) =>
        conversations ? sortConversations(conversations.map((conversation) => (conversation.party.code === party.code ? { ...conversation, party: { ...conversation.party, ...party } } : conversation))) : conversations,
    );
}

export function migrateChatPartyCode(queryClient: QueryClient, previousCode: string, party: Party) {
    queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.conversations(), (conversations) =>
        conversations ? sortConversations(conversations.map((conversation) => (conversation.party.code === previousCode ? { ...conversation, party: { ...conversation.party, ...party } } : conversation))) : conversations,
    );
    queryClient.removeQueries({ queryKey: queryKeys.chat.presence(previousCode) });
    queryClient.removeQueries({ queryKey: ["paginated", ...queryKeys.chat.messages(previousCode)] });
}

function updateConversation(queryClient: QueryClient, partyCode: string, update: (conversation: ChatConversation) => ChatConversation) {
    queryClient.setQueryData<ChatConversation[]>(queryKeys.chat.conversations(), (conversations) => {
        if (!conversations) return conversations;

        let changed = false;
        const next = conversations.map((conversation) => {
            if (conversation.party.code !== partyCode) return conversation;
            changed = true;
            return update(conversation);
        });

        return changed ? sortConversations(next) : conversations;
    });
}

function updateMessageCaches(queryClient: QueryClient, partyCode: string, update: (messages: ChatMessage[]) => ChatMessage[]) {
    for (const [key, data] of queryClient.getQueriesData<ChatPages>({ queryKey: ["paginated", ...queryKeys.chat.messages(partyCode)] })) {
        if (!data) continue;

        queryClient.setQueryData<ChatPages>(key, {
            ...data,
            pages: data.pages.map((page) => ({ ...page, items: update(page.items) })),
        });
    }
}

export function applyChatMessage(queryClient: QueryClient, partyCode: string, message: ChatMessage, currentUserId: string | undefined, activePartyCode: string | null) {
    updateMessageCaches(queryClient, partyCode, (messages) => [message, ...messages.filter((item) => item.id !== message.id)]);

    const isMine = message.senderId === currentUserId;
    const isActive = activePartyCode === partyCode;

    updateConversation(queryClient, partyCode, (conversation) => ({
        ...conversation,
        lastMessage: message,
        unreadCount: isMine ? conversation.unreadCount : isActive ? 0 : conversation.unreadCount + 1,
    }));
}

export function applyChatMessageUpdate(queryClient: QueryClient, partyCode: string, message: ChatMessage) {
    updateMessageCaches(queryClient, partyCode, (messages) => messages.map((item) => (item.id === message.id ? message : item)));

    updateConversation(queryClient, partyCode, (conversation) => (conversation.lastMessage?.id === message.id ? { ...conversation, lastMessage: message } : conversation));
}

export function applyChatMessageDelete(queryClient: QueryClient, partyCode: string, messageId: string) {
    updateMessageCaches(queryClient, partyCode, (messages) => messages.filter((item) => item.id !== messageId));

    let shouldRefetch = false;

    updateConversation(queryClient, partyCode, (conversation) => {
        if (conversation.lastMessage?.id !== messageId) return conversation;
        shouldRefetch = true;
        return { ...conversation, lastMessage: null };
    });

    if (shouldRefetch) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    }
}

export function applyChatRead(queryClient: QueryClient, partyCode: string, lastReadAt: string) {
    updateConversation(queryClient, partyCode, (conversation) => ({ ...conversation, unreadCount: 0, lastReadAt }));
}

export function applyChatPresence(queryClient: QueryClient, presence: ChatPresence) {
    queryClient.setQueryData<ChatPresence>(queryKeys.chat.presence(presence.partyCode), presence);
}

export function totalUnread(conversations: ChatConversation[] | undefined) {
    return conversations?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;
}

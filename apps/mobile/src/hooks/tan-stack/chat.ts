import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatConversation, ChatMessage, ChatPresence } from "@companion/shared-types";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";
import { applyChatRead } from "@/lib/chat-cache";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { requestApi } from "@/lib/api/request-api";
import { useAuth } from "@/contexts/auth-context";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";

export function useGetChatConversations(options?: TQueryOptions<ChatConversation[]>) {
    const { user } = useAuth();

    return useQuery({
        ...options,
        initialData: [],
        enabled: !!user?.id && options?.enabled !== false,
        placeholderData: keepPreviousData,
        queryKey: queryKeys.chat.conversations(),
        queryFn: async () => requestApi(() => api.get<ChatConversation[]>("/chat/conversations")),
    });
}

export function useGetChatMessagesInfinite(code: string) {
    return usePaginatedQuery<ChatMessage>([...queryKeys.chat.messages(code)], `/chat/${code}/messages`, {}, !!code);
}

export function useGetChatPresence(code: string, options?: TQueryOptions<ChatPresence>) {
    return useQuery({
        ...options,
        initialData: { partyCode: code, onlineUserIds: [] },
        enabled: !!code && options?.enabled !== false,
        queryKey: queryKeys.chat.presence(code),
        queryFn: async () => requestApi(() => api.get<ChatPresence>(`/chat/${code}/presence`)),
    });
}

export function useMarkChatRead(options?: TMutationOptions<{ lastReadAt: string }, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (code: string) => requestApi(() => api.post<{ lastReadAt: string }>(`/chat/${code}/read`)),
        onSuccess: (data, code, ...args) => {
            applyChatRead(queryClient, code, data.lastReadAt);
            options?.onSuccess?.(data, code, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

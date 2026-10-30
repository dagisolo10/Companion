import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { queryKeys, queryRoots } from "@/constants/query-keys";
import { CreateQuestDto, UpdateQuestDto } from "@/types/dto";
import { Filter, Quest, QuestDetail } from "@/types/models";
import { updateQuestCaches } from "@/lib/query-cache";
import { requestApi } from "@/lib/api/request-api";
import { api } from "@/lib/api/axios";


export function useGetPartyQuests(code: string, status?: Filter, options?: TQueryOptions<Quest[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.quest.byParty(code, status),
        queryFn: async () => requestApi(() => api.get<Quest[]>(`/quest/${code}`, { params: { status } })),
    });
}

export function useGetPartyQuestsInfinite(code: string, status?: Filter) {
    return usePaginatedQuery<Quest>([...queryKeys.quest.byParty(code, status)], `/quest/${code}`, { status }, !!code);
}

export function useGetMyQuestsInfinite(status?: Filter) {
    return usePaginatedQuery<Quest>([...queryKeys.quest.my(status)], "/quest/my", { status });
}

export function useGetMyQuests(status?: Filter, take?: number, options?: TQueryOptions<Quest[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.quest.my(status, take),
        queryFn: async () => requestApi(() => api.get<Quest[]>("/quest/my", { params: { status, take } })),
    });
}

export function useGetQuest(id: string, code: string, options?: TQueryOptions<QuestDetail>) {
    return useQuery({
        ...options,
        refetchInterval: (query) => {
            const quest = query.state.data;
            return quest && (quest.status === "Upcoming" || (quest.status === "Active" && !!quest.expiresAt)) ? 15_000 : false;
        },
        queryKey: queryKeys.quest.byId(id, code),
        queryFn: async () => requestApi(() => api.get<QuestDetail>(`/quest/${id}/${code}`)),
    });
}

export function useCreateQuest(options?: TMutationOptions<Quest, CreateQuestDto>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data: CreateQuestDto) => requestApi(() => api.post<Quest>("/quest", data)),
        onError: (error, ...args) => options?.onError?.(error, ...args),
        onSuccess: async (quest, ...args) => {
            await updateQuestCaches(queryClient, quest, { prependWhenMissing: true });
            options?.onSuccess?.(quest, ...args);
        },
    });
}

export function useUpdateQuest(options?: TMutationOptions<Quest, { id: string; data: UpdateQuestDto }>) {
    const queryClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Quest>(`/quest/${id}`, data)),
        onError: (error, ...args) => options?.onError?.(error, ...args),
        onSuccess: async (quest, ...args) => {
            await updateQuestCaches(queryClient, quest);
            options?.onSuccess?.(quest, ...args);
        },
    });
}

export function useCompleteQuest(options?: TMutationOptions<Quest, { id: string; code: string }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, code }) => requestApi(() => api.patch<Quest>(`/quest/${id}/${code}/complete`)),
        onError: (error, ...args) => options?.onError?.(error, ...args),
        onSuccess: async (quest, ...args) => {
            await updateQuestCaches(queryClient, quest, { prependWhenMissing: true });

            await queryClient.invalidateQueries({ queryKey: queryKeys.quest.byId(quest.id, quest.party.code) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
            await queryClient.invalidateQueries({ queryKey: [...queryRoots.questActivity, "my"] });
            await queryClient.invalidateQueries({ queryKey: ["paginated", ...queryRoots.questActivity] });
            await queryClient.invalidateQueries({ queryKey: [...queryRoots.user, "me"] });
            await queryClient.invalidateQueries({ queryKey: queryKeys.user.leaderboard() });
            await queryClient.invalidateQueries({ queryKey: queryKeys.party.leaderboard(quest.party.code) });

            options?.onSuccess?.(quest, ...args);
        },
    });
}

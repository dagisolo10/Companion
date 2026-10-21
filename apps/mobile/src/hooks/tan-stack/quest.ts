import { queryKeys, queryRoots } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { CreateQuestDto, UpdateQuestDto } from "@/types/dto";
import { Filter, Quest, QuestDetail } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetPartyQuests(code: string, options?: TQueryOptions<Quest[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.quest.byParty(code),
        queryFn: async () => requestApi(() => api.get<Quest[]>(`/quest/${code}`)),
    });
}

export function useGetMyQuests(status?: Filter, options?: TQueryOptions<Quest[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.quest.my(status),
        queryFn: async () => requestApi(() => api.get<Quest[]>("/quest/my", { params: { status } })),
    });
}

export function useGetQuest(id: string, code: string, options?: TQueryOptions<QuestDetail>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.quest.byId(id, code),
        queryFn: async () => requestApi(() => api.get<QuestDetail>(`/quest/${id}/${code}`)),
    });
}

export function useCreateQuest(options?: TMutationOptions<Quest, CreateQuestDto>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data: CreateQuestDto) => requestApi(() => api.post<Quest>("/quest", data)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useUpdateQuest(options?: TMutationOptions<Quest, { id: string; data: UpdateQuestDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Quest>(`/quest/${id}`, data)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useCompleteQuest(options?: TMutationOptions<Quest, { id: string; code: string }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, code }) => requestApi(() => api.patch<Quest>(`/quest/${id}/${code}/complete`)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.questActivity });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            queryClient.invalidateQueries({ queryKey: queryRoots.user });
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

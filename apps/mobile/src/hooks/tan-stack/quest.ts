import { queryKeys, useInvalidateAll } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { CreateQuestDto, UpdateQuestDto } from "@/types/dto";
import { Filter, Quest, QuestDetail } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetPartyQuests(code: string, options?: TQueryOptions<Quest[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.quest.byParty(code),
        queryFn: async () => requestApi(() => api.get<Quest[]>(`/quest/${code}`)),
    });
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
        onSuccess: (quest, ...args) => {
            queryClient.setQueryData(queryKeys.quest.byId(quest.id, quest.party.code), quest);
            queryClient.setQueryData(queryKeys.quest.byParty(quest.party.code), quest);
            queryClient.setQueryData(queryKeys.quest.my(), quest);
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
        onSuccess: (quest, ...args) => {
            queryClient.setQueryData(queryKeys.quest.byId(quest.id, quest.party.code), quest);
            queryClient.setQueryData(queryKeys.quest.byParty(quest.party.code), quest);
            queryClient.setQueryData(queryKeys.quest.my(), quest);
            options?.onSuccess?.(quest, ...args);
        },
    });
}

export function useCompleteQuest(options?: TMutationOptions<Quest, { id: string; code: string }>) {
    const invalidateALl = useInvalidateAll();

    return useMutation({
        ...options,
        mutationFn: async ({ id, code }) => requestApi(() => api.patch<Quest>(`/quest/${id}/${code}/complete`)),
        onError: (error, ...args) => options?.onError?.(error, ...args),
        onSuccess: (data, ...args) => {
            invalidateALl();
            options?.onSuccess?.(data, ...args);
        },
    });
}

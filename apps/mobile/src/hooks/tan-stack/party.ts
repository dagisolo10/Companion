import { queryKeys, queryRoots } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { CreatePartyDto, TransferPartyDto, UpdatePartyDto } from "@/types/dto";
import { PartyLeaderboardMember } from "@/types/leaderboard";
import { Party, PartyDetail } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetMyParties(options?: TQueryOptions<PartyDetail[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.party.my(),
        queryFn: async () => requestApi(() => api.get<PartyDetail[]>("/party/my")),
    });
}

export function useGetAllParties(query?: string, options?: TQueryOptions<PartyDetail[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.party.all(query),
        queryFn: async () => requestApi(() => api.get<PartyDetail[]>("/party/all", { params: { q: query } })),
    });
}

export function useGetParty(code: string, options?: TQueryOptions<PartyDetail>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.party.byCode(code),
        queryFn: async () => requestApi(() => api.get<PartyDetail>(`/party/${code}`)),
    });
}

export function useSearchParty(code: string, options?: TQueryOptions<Party>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.party.search(code),
        queryFn: async () => requestApi(() => api.get<Party>(`/party/search/${code}`)),
    });
}

export function useGetPartyLeaderboard(code: string, options?: TQueryOptions<PartyLeaderboardMember[]>) {
    return useQuery({
        ...options,
        enabled: !!code && options?.enabled !== false,
        queryKey: queryKeys.party.leaderboard(code),
        queryFn: async () => requestApi(() => api.get<PartyLeaderboardMember[]>(`/party/leaderboard/${code}`)),
    });
}

export function useCreateParty(options?: TMutationOptions<Party, CreatePartyDto>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data) => requestApi(() => api.post<Party>("/party/create", data)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useUpdateParty(options?: TMutationOptions<Party, { id: string; data: UpdatePartyDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Party>(`/party/${id}`, data)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useRegeneratePartyCode(options?: TMutationOptions<Party, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (id: string) => requestApi(() => api.patch<Party>(`/party/regenerate-code/${id}`)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useTransferParty(options?: TMutationOptions<Party, { id: string; data: TransferPartyDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Party>(`/party/transfer/${id}`, data)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.user });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useDeleteParty(options?: TMutationOptions<SuccessResponse, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (id: string) => requestApi(() => api.delete<SuccessResponse>(`/party/delete/${id}`)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.questActivity });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            queryClient.invalidateQueries({ queryKey: queryRoots.user });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

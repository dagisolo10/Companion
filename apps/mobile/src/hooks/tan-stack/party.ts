import { createPartyCaches, deletePartyCaches, regeneratePartyCaches, updatePartyCaches } from "@/lib/query-cache";
import { CreatePartyDto, TransferPartyDto, UpdatePartyDto } from "@/types/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { PartyLeaderboardMember } from "@/types/leaderboard";
import { Party, PartyDetail } from "@/types/models";
import { requestApi } from "@/lib/api/request-api";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";


export function useGetMyParties(options?: TQueryOptions<PartyDetail[]>) {
    return useQuery({
        ...options,
        initialData: [],
        queryKey: queryKeys.party.my(),
        queryFn: async () => requestApi(() => api.get<PartyDetail[]>("/party/my")),
    });
}

export function useGetAllParties(query?: string, options?: TQueryOptions<PartyDetail[]>) {
    return useQuery({
        ...options,
        initialData: [],
        queryKey: queryKeys.party.all(query),
        queryFn: async () => requestApi(() => api.get<PartyDetail[]>("/party/all", { params: { q: query } })),
    });
}

export function useGetAllPartiesInfinite(query?: string, enabled = true) {
    return usePaginatedQuery<PartyDetail>([...queryKeys.party.all(query)], "/party/all", { q: query, excludeJoined: true }, enabled);
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
        initialData: [],
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
        onSuccess: async (party, ...args) => {
            await createPartyCaches(queryClient, party);
            options?.onSuccess?.(party, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useUpdateParty(options?: TMutationOptions<Party, { id: string; data: UpdatePartyDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Party>(`/party/${id}`, data)),
        onSuccess: async (party, ...args) => {
            await updatePartyCaches(queryClient, party);
            options?.onSuccess?.(party, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useRegeneratePartyCode(options?: TMutationOptions<Party, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (id: string) => requestApi(() => api.patch<Party>(`/party/regenerate-code/${id}`)),
        onSuccess: async (party, ...args) => {
            await regeneratePartyCaches(queryClient, party);
            options?.onSuccess?.(party, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useTransferParty(options?: TMutationOptions<Party, { id: string; data: TransferPartyDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => requestApi(() => api.patch<Party>(`/party/transfer/${id}`, data)),
        ...options,
        onSuccess: async (party, ...args) => {
            options?.onSuccess?.(party, ...args);
            await updatePartyCaches(queryClient, party);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useDeleteParty(options?: TMutationOptions<Party, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (id: string) => requestApi(() => api.delete<Party>(`/party/delete/${id}`)),
        onSuccess: async (party, ...args) => {
            options?.onSuccess?.(party, ...args);
            await deletePartyCaches(queryClient, party);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

import { queryKeys, queryRoots } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { RemoveMemberDto } from "@/types/dto";
import { PartyMember } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetMembers(code: string, options?: TQueryOptions<PartyMember[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.partyMember.members(code),
        queryFn: async () => requestApi(() => api.get<PartyMember[]>(`/party-member/members/${code}`)),
    });
}

export function useJoinParty(options?: TMutationOptions<PartyMember, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (code: string) => requestApi(() => api.post<PartyMember>(`/party-member/join/${code}`)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useLeaveParty(options?: TMutationOptions<SuccessResponse, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (code: string) => requestApi(() => api.delete<SuccessResponse>(`/party-member/leave/${code}`)),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            queryClient.invalidateQueries({ queryKey: queryRoots.quest });
            queryClient.invalidateQueries({ queryKey: queryRoots.dashboard });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useRemoveMember(options?: TMutationOptions<SuccessResponse, { code: string; data: RemoveMemberDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ code, data }) => requestApi(() => api.delete<SuccessResponse>(`/party-member/remove/${code}`, { data })),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.party });
            queryClient.invalidateQueries({ queryKey: queryRoots.partyMember });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

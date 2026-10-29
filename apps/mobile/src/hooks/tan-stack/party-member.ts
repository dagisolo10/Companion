import { joinPartyCaches, leavePartyCaches, removePartyMemberCaches } from "@/lib/query-cache";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { RemoveMemberDto } from "@/types/dto";
import { PartyMember } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";

export function useGetMembers(code: string, options?: TQueryOptions<PartyMember[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.partyMember.members(code),
        queryFn: async () => requestApi(() => api.get<PartyMember[]>(`/party-member/members/${code}`)),
    });
}

export function useGetMembersInfinite(code: string) {
    return usePaginatedQuery<PartyMember>([...queryKeys.partyMember.members(code)], `/party-member/members/${code}`);
}

export function useJoinParty(options?: TMutationOptions<PartyMember, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (code: string) => requestApi(() => api.post<PartyMember>(`/party-member/join/${code}`)),
        onSuccess: (member, code, ...args) => {
            joinPartyCaches(queryClient, code, member);
            options?.onSuccess?.(member, code, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useLeaveParty(options?: TMutationOptions<SuccessResponse, string>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (code: string) => requestApi(() => api.delete<SuccessResponse>(`/party-member/leave/${code}`)),
        onSuccess: (data, code, ...args) => {
            leavePartyCaches(queryClient, code);
            options?.onSuccess?.(data, code, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

export function useRemoveMember(options?: TMutationOptions<PartyMember, { code: string; data: RemoveMemberDto }>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async ({ code, data }) => requestApi(() => api.delete<PartyMember>(`/party-member/remove/${code}`, { data })),
        onSuccess: (data, vars, ...args) => {
            removePartyMemberCaches(queryClient, vars.code, data);
            options?.onSuccess?.(data, vars, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

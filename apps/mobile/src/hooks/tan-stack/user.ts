import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { queryKeys, queryRoots } from "@/constants/query-keys";
import { SuccessResponse } from "@/types/response";
import { requestApi } from "@/lib/api/request-api";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/types/models";
import { api } from "@/lib/api/axios";


export function useGetUser(options?: TQueryOptions<User>) {
    const { user } = useAuth();

    return useQuery({
        ...options,
        enabled: !!user?.id,
        queryKey: queryKeys.user.me(user?.id),
        queryFn: async () => requestApi(() => api.get<User>("/user")),
    });
}

export function useDeleteUser(options?: TMutationOptions<SuccessResponse>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async () => requestApi(() => api.delete<SuccessResponse>("/user")),
        onSuccess: (data, ...args) => {
            queryClient.invalidateQueries({ queryKey: queryRoots.user });
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

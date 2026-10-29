import { syncUserCaches } from "@/lib/query-cache";
import { queryKeys, useInvalidateAll } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { UpdateUserDto } from "@/types/dto";
import { User } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";

export function useGetUser(options?: TQueryOptions<User>) {
    const { user } = useAuth();

    return useQuery({
        ...options,
        enabled: !!user?.id,
        queryKey: queryKeys.user.me(user?.id),
        queryFn: async () => requestApi(() => api.get<User>("/user")),
    });
}

export function useIsUsernameAvailable(username: string, options?: TQueryOptions<boolean>) {
    return useQuery({
        ...options,
        placeholderData: keepPreviousData,
        queryKey: queryKeys.user.username(username),
        queryFn: async () => requestApi(() => api.get<boolean>(`/user/username/${username}`)),
    });
}

export function useFindUser(username: string, options?: TQueryOptions<User>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.user.other(username),
        queryFn: async () => requestApi(() => api.get<User>(`/user/${username}`)),
    });
}

export function useSearchUsers(query: string, options?: TQueryOptions<User[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.user.search(query),
        queryFn: async () => requestApi(() => api.get<User[]>("/user/search", { params: { query } })),
    });
}

export function useSearchUsersInfinite(query: string, enabled = true) {
    return usePaginatedQuery<User>([...queryKeys.user.search(query)], "/user/search", { query }, enabled);
}

export function useGetLeaderboard(options?: TQueryOptions<User[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.user.leaderboard(),
        queryFn: async () => requestApi(() => api.get<User[]>("/user/leaderboard")),
    });
}

export function useUpdateUser(options?: TMutationOptions<User, UpdateUserDto>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data: UpdateUserDto) => requestApi(() => api.patch<User>("/user", data)),
        onError: (error, ...args) => options?.onError?.(error, ...args),
        onSuccess: (user, ...args) => {
            syncUserCaches(queryClient, user);
            options?.onSuccess?.(user, ...args);
        },
    });
}

export function useDeleteUser(options?: TMutationOptions<SuccessResponse>) {
    const invalidateALl = useInvalidateAll();

    return useMutation({
        ...options,
        mutationFn: async () => requestApi(() => api.delete<SuccessResponse>("/user")),
        onSuccess: (data, ...args) => {
            invalidateALl();
            options?.onSuccess?.(data, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
    });
}

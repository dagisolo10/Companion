import { queryKeys, queryRoots } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { UpdateUserDto } from "@/types/dto";
import { User } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useUpdateUser(options?: TMutationOptions<User, UpdateUserDto>) {
    const queryClient = useQueryClient();

    return useMutation({
        ...options,
        mutationFn: async (data: UpdateUserDto) => requestApi(() => api.patch<User>("/user", data)),
        onSuccess: (user, ...args) => {
            queryClient.setQueryData<User>(queryKeys.user.me(user.id), user);
            options?.onSuccess?.(user, ...args);
        },
        onError: (error, ...args) => options?.onError?.(error, ...args),
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

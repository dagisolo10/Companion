import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { UpdateUserDto } from "@/types/dto";
import { User } from "@/types/models";
import { TMutationOptions, TQueryOptions } from "@/types/options";
import { SuccessResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export function useUpdateUser(options?: TMutationOptions<User, UpdateUserDto>) {
    return useMutation({
        ...options,
        mutationFn: async (data: UpdateUserDto) => requestApi(() => api.patch<User>("/user", data)),
    });
}

export function useDeleteUser(options?: TMutationOptions<SuccessResponse>) {
    return useMutation({
        ...options,
        mutationFn: async () => requestApi(() => api.delete<SuccessResponse>("/user")),
    });
}

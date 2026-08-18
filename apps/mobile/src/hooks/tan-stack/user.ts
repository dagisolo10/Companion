import { api } from "@/lib/api/axios";
import { User } from "@/types/models";
import { UpdateUserDto } from "@/types/dto";
import { queryKeys } from "@/constants/query-keys";
import { requestApi } from "@/lib/api/request-api";
import { SuccessResponse } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TMutationOptions, TQueryOptions } from "@/types/options";

export function useGetUser<T = User>(options?: TQueryOptions<T>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.user.me(),
        queryFn: async () => requestApi(() => api.get<T>("/user")),
    });
}

export function useIsUsernameAvailable<T = boolean>(username: string, options?: TQueryOptions<T>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.user.username(username),
        queryFn: async () => requestApi(() => api.get<T>(`/user/username/${username}`)),
    });
}

export function useFindUser<T = User>(username: string, options?: TQueryOptions<T>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.user.other(username),
        queryFn: async () => requestApi(() => api.get<T>(`/user/${username}`)),
    });
}

export function useUpdateUser<T = User, P = UpdateUserDto>(options?: TMutationOptions<T, P>) {
    return useMutation({
        ...options,
        mutationFn: async (data: P) => requestApi(() => api.patch<T>("/user", data)),
    });
}

export function useDeleteUser(options?: TMutationOptions<SuccessResponse>) {
    return useMutation({
        ...options,
        mutationFn: async () => requestApi(() => api.delete<SuccessResponse>("/user")),
    });
}

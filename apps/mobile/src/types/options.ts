import type { UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export type TQueryOptions<TQueryFnData> = Omit<UseQueryOptions<TQueryFnData, Error>, "queryFn" | "queryKey">;
export type TMutationOptions<TData, TVariables = void, TContext = unknown> = Omit<UseMutationOptions<TData, Error, TVariables, TContext>, "mutationFn">;
export type TInfiniteQueryOptions<TQueryFnData> = Omit<UseInfiniteQueryOptions<TQueryFnData, Error, TQueryFnData, (string | number)[], number>, "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">;

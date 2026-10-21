import { api } from "@/lib/api/axios";
import { TQueryOptions } from "@/types/options";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { requestApi } from "@/lib/api/request-api";

export type DashboardData = {
    weekXp: number;
    todayXp: number;
    monthXp: number;
    allTimeXp: number;
    weekCompleted: number;
    monthCompleted: number;
    todayCompleted: number;
    allTimeCompleted: number;
};

export const defaultDashboard: DashboardData = {
    weekXp: 0,
    todayXp: 0,
    monthXp: 0,
    allTimeXp: 0,
    weekCompleted: 0,
    monthCompleted: 0,
    todayCompleted: 0,
    allTimeCompleted: 0,
};

export function useGetDashboard(options?: TQueryOptions<DashboardData>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.dashboard(),
        queryFn: async () => requestApi(() => api.get<DashboardData>("/dashboard")),
    });
}

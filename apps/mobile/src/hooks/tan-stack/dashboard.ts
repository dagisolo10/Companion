import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { DashboardData } from "@/types/models";
import { TQueryOptions } from "@/types/options";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const defaultDashboard: DashboardData = {
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
        initialData: defaultDashboard,
        queryKey: queryKeys.dashboard(),
        placeholderData: keepPreviousData,
        queryFn: async () => requestApi(() => api.get<DashboardData>("/dashboard")),
    });
}

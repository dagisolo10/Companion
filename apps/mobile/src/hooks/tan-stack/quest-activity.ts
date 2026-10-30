import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QuestActivity } from "@companion/shared-types";
import { requestApi } from "@/lib/api/request-api";
import { queryKeys } from "@/constants/query-keys";
import { TQueryOptions } from "@/types/options";
import { api } from "@/lib/api/axios";

export function useGetMyQuestActivities(take?: number, options?: TQueryOptions<QuestActivity[]>) {
    return useQuery({
        ...options,
        initialData: [],
        placeholderData: keepPreviousData,
        queryKey: queryKeys.questActivity.my(take),
        queryFn: async () => requestApi(() => api.get<QuestActivity[]>("/quest-activity", { params: { take } })),
    });
}

export function useGetMyQuestActivitiesInfinite() {
    return usePaginatedQuery<QuestActivity>([...queryKeys.questActivity.my()], "/quest-activity");
}

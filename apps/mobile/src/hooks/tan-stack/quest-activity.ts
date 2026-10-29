import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { QuestActivity } from "@/types/models";
import { TQueryOptions } from "@/types/options";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/hooks/custom/use-paginated-query";

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

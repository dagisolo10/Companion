import { api } from "@/lib/api/axios";
import { QuestActivity } from "@/types/models";
import { queryKeys } from "@/constants/query-keys";
import { requestApi } from "@/lib/api/request-api";
import { useQuery } from "@tanstack/react-query";
import { TQueryOptions } from "@/types/options";

export function useGetMyQuestActivities(options?: TQueryOptions<QuestActivity[]>) {
    return useQuery({
        ...options,
        queryKey: queryKeys.questActivity.my(),
        queryFn: async () => requestApi(() => api.get<QuestActivity[]>("/quest-activity")),
    });
}

import { useInfiniteQuery } from "@tanstack/react-query";
import { requestApi } from "@/lib/api/request-api";
import { PaginatedResult } from "@/types/response";
import { api } from "@/lib/api/axios";
import { useMemo } from "react";


export function usePaginatedQuery<T extends { id: string }>(queryKey: readonly unknown[], path: string, params: Record<string, string | number | boolean | undefined> = {}, enabled = true) {
    const query = useInfiniteQuery({
        enabled,
        initialPageParam: 1,
        queryKey: ["paginated", ...queryKey, params],
        queryFn: async ({ pageParam }) => requestApi(() => api.get<PaginatedResult<T>>(path, { params: { ...params, page: pageParam, limit: 20 } })),
        getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    });

    const data = useMemo(() => {
        const items = query.data?.pages.flatMap((page) => page.items) ?? [];
        return Array.from(new Map(items.map((item) => [item.id, item])).values());
    }, [query.data?.pages]);

    return { ...query, data };
}

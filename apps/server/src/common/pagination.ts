export type PaginatedResult<T> = { items: T[]; nextPage: number | null; hasMore: boolean };
export type PageParams = { page: number; limit: number };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export function parsePageParams(page?: string, limit?: string): PageParams {
    const parsedPage = Number.parseInt(page ?? "1", 10);
    const parsedLimit = Number.parseInt(limit ?? String(DEFAULT_LIMIT), 10);
    return {
        page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, MAX_LIMIT) : DEFAULT_LIMIT,
    };
}

export async function paginate<T>(params: PageParams, fetchPage: (args: { skip: number; take: number }) => Promise<T[]>): Promise<PaginatedResult<T>> {
    const rows = await fetchPage({ skip: (params.page - 1) * params.limit, take: params.limit + 1 });
    const hasMore = rows.length > params.limit;

    return {
        hasMore,
        nextPage: hasMore ? params.page + 1 : null,
        items: hasMore ? rows.slice(0, params.limit) : rows,
    };
}

export type SuccessResponse = { success: boolean };

export type PaginatedResult<T> = {
    items: T[];
    hasMore: boolean;
    nextPage: number | null;
};

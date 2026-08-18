export function hasApiError(result: unknown): result is ApiError {
    return typeof result === "object" && result !== null && "error" in result;
}

export type ApiError = {
    error: string;
    message: string[];
    statusCode: number;
};

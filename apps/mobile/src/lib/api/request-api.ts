import { AxiosResponse, isAxiosError } from "axios";

type ApiError = {
    error: string;
    message: string;
    statusCode: number;
};

function isApiErrorResponse(result: unknown): result is ApiError {
    return typeof result === "object" && result !== null && "error" in result && "message" in result && "statusCode" in result;
}

export async function requestApi<T>(request: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
        const { data } = await request();

        if (isApiErrorResponse(data)) {
            throw data;
        }

        return data;
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const serverData = error.response.data;
            throw serverData || "Network request failed. Try again.";
        }

        throw error;
    }
}

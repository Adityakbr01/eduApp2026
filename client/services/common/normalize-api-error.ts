import axios, { AxiosError } from "axios";
import type { ApiErrorPayload, NormalizedApiError } from "./api-error.types";

export function normalizeApiError(error: unknown): NormalizedApiError {
    // 📴 Network / CORS / Timeout
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        // No response → network issue
        if (!axiosError.response) {
            return {
                message: "Network error. Please check your internet connection.",
                isNetworkError: true,
            };
        }

        const payload = axiosError.response.data?.error as ApiErrorPayload | undefined;

        // Backend error (expected)
        if (payload) {
            const fieldErrors: Record<string, string> = {};

            payload.details?.forEach((d) => {
                fieldErrors[d.path] = d.message;
            });

            return {
                code: payload.code,
                message: payload.message || "Request failed",
                fieldErrors: Object.keys(fieldErrors).length
                    ? fieldErrors
                    : undefined,
                isAuthError: axiosError.response.status === 401,
            };
        }

        // Fallback axios error
        return {
            message: axiosError.message || "Request failed",
        };
    }

    // 🧨 Non-axios / runtime errors
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    }

    // 🧊 Absolute fallback
    return {
        message: "Something went wrong",
    };
}

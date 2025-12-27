import { AxiosError } from "axios";

export interface ApiFieldError {
    path: string;
    message: string;
}

export interface NormalizedApiError {
    code?: string;
    message: string;
    fieldErrors?: Record<string, string>;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
    if (error instanceof AxiosError) {
        const err = error.response?.data?.error;

        if (err?.details?.length) {
            const fieldErrors: Record<string, string> = {};

            err.details.forEach((d: ApiFieldError) => {
                fieldErrors[d.path] = d.message;
            });

            return {
                code: err.code,
                message: err.message,
                fieldErrors,
            };
        }

        return {
            code: err?.code,
            message: err?.message || "Something went wrong",
        };
    }

    return {
        message: "Unexpected error occurred",
    };
}

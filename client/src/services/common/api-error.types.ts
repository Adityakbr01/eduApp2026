export interface ApiErrorDetail {
    path: string;
    message: string;
}

export interface ApiErrorPayload {
    code?: string;
    message: string;
    details?: ApiErrorDetail[];
}

export interface NormalizedApiError {
    code?: string;
    message: string;
    fieldErrors?: Record<string, string>;
    isNetworkError?: boolean;
    isAuthError?: boolean;
}

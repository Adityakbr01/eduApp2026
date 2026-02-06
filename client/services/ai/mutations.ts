import { useMutation } from "@tanstack/react-query";
import { aiApi, type GenerateEmailParams, type ImproveEmailParams, type SubjectSuggestionsParams } from "./api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface ApiErrorResponse {
    message?: string;
}

/**
 * Hook to generate email content using AI
 */
export const useGenerateEmail = () => {
    return useMutation({
        mutationFn: (params: GenerateEmailParams) => aiApi.generateEmail(params),
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to generate email content");
        },
    });
};

/**
 * Hook to improve email content using AI
 */
export const useImproveEmail = () => {
    return useMutation({
        mutationFn: (params: ImproveEmailParams) => aiApi.improveEmail(params),
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to improve email content");
        },
    });
};

/**
 * Hook to generate subject line suggestions
 */
export const useGetSubjectSuggestions = () => {
    return useMutation({
        mutationFn: (params: SubjectSuggestionsParams) => aiApi.getSubjectSuggestions(params),
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to generate suggestions");
        },
    });
};

import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { ApiResponse, SessionData, UserProfileResponse } from "./types";


const authApi = {
    getCurrentUser: async (): Promise<UserProfileResponse> => {
        try {
            const { data } = await api.get<ApiResponse<UserProfileResponse>>("/auth/me");
            console.log("✅ /auth/me success:", data);
            return data.data!;
        } catch (error) {
            console.error("❌ /auth/me failed:", error);
            throw error;
        }
    },
    getSession: async () => {
        const { data } = await api.get("/auth/session", {
            withCredentials: true,
        });
        return data;
    },
};

export const useGetCurrentUser = (
    options?: Omit<
        UseQueryOptions<UserProfileResponse, Error>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery<UserProfileResponse, Error>({
        queryKey: QUERY_KEYS.AUTH.ME,
        queryFn: authApi.getCurrentUser,
        staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 mins
        gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 mins
        retry: 1,
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
        ...options,
    });
};


export const useGetSession = (
    options?: Omit<
        UseQueryOptions<ApiResponse<SessionData>, Error>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery<ApiResponse<SessionData>, Error>({
        queryKey: ["auth", "session"],
        queryFn: authApi.getSession,
        staleTime: 1000 * 60,
        retry: false,
        refetchOnWindowFocus: false,
        ...options,
    });
};


const authQueries = {
    api: authApi,
    useGetCurrentUser,
    useGetSession,
};

export default authQueries;
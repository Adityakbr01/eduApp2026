import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, SessionData, UserProfileResponse } from "./types";
import { useEffect } from "react";

/* ---------------- API ---------------- */

export const authApi = {
    getSession: async (): Promise<ApiResponse<SessionData>> => {
        const { data } = await api.get("/auth/session", {
            withCredentials: true,
        });
        return data;
    },

    getCurrentUser: async (): Promise<UserProfileResponse> => {
        const { data } = await api.get<ApiResponse<UserProfileResponse>>(
            "/auth/me"
        );
        return data.data!;
    },
};

/* ---------------- /auth/me ---------------- */

export const useGetCurrentUser = () => {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const setUser = useAuthStore((s) => s.setUser);
    const markHydrated = useAuthStore((s) => s.markHydrated);

    const query = useQuery<UserProfileResponse>({
        queryKey: QUERY_KEYS.AUTH.ME,
        queryFn: authApi.getCurrentUser,

        enabled: isLoggedIn, // 🔥 race condition killer

        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    // ✅ success side-effect
    useEffect(() => {
        if (query.isSuccess && query.data) {
            setUser(query.data.user);
        }
    }, [query.isSuccess, query.data, setUser]);

    // ✅ hydration (success OR error)
    useEffect(() => {
        if (query.isFetched) {
            markHydrated();
        }
    }, [query.isFetched, markHydrated]);

    return query;
};

/* ---------------- /auth/session ---------------- */

export const useGetSession = () => {
    const markLoggedIn = useAuthStore((s) => s.markLoggedIn);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const query = useQuery<ApiResponse<SessionData>>({
        queryKey: ["auth", "session"],
        queryFn: authApi.getSession,

        retry: false,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.isSuccess) {
            if (query.data?.data?.isAuthenticated) {
                markLoggedIn(); // ✅ only boolean
            } else {
                clearAuth();
            }
        }
    }, [query.isSuccess, query.data, markLoggedIn, clearAuth]);

    useEffect(() => {
        if (query.isError) {
            clearAuth();
        }
    }, [query.isError, clearAuth]);

    return query;
};

/* ---------------- export ---------------- */

const authQueries = {
    api: authApi,
    useGetCurrentUser,
    useGetSession,
};

export default authQueries;

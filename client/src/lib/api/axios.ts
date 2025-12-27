// lib/api/axios.ts
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";


const AUTH_IGNORE_ROUTES = [
    "/auth/session",
    "/auth/me",
    "/auth/token-refresh",
];


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
    withCredentials: true, // ✅ cookies (access + refresh)
    timeout: 15000,
});

/**
 * REQUEST INTERCEPTOR
 * (Nothing auth-related here)
 */
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url as string | undefined;
        const apiError = error?.response?.data?.error;
        const errorCode = apiError?.code;

        // Ignore auth bootstrap routes
        if (
            status === 401 &&
            url &&
            AUTH_IGNORE_ROUTES.some((r) => url.includes(r))
        ) {
            return Promise.reject(error);
        }

        /**
         * 🔐 SESSION EXPIRED (real logout case)
         */
        if (status === 401 && errorCode === "SESSION_EXPIRED") {
            const { clearAuth } = useAuthStore.getState();

            clearAuth();
            toast.error("Session expired. Please login again.");

            return Promise.reject(error);
        }

        /**
         * ❌ INVALID CREDENTIALS (login / OTP / password)
         */
        if (status === 401 && errorCode === "INVALID_CREDENTIALS") {
            // ❗ do NOT logout
            return Promise.reject(error);
        }

        /**
         * 🚫 FORBIDDEN
         */
        if (status === 403) {
            toast.error(apiError?.message || "Access denied");
            return Promise.reject(error);
        }

        //Todo : Enable rate limit handling later
        // if (status === 429) {
        //     toast.error("Too many requests. Please try again later.");
        //     return Promise.reject(error);
        // }

        if (status >= 500) {
            toast.error("Server error. Please try again later.");
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);



export default api;

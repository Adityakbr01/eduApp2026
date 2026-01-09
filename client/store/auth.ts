// store/auth.ts
import { create } from "zustand";
import { User } from "@/services/auth";

interface AuthState {
    user: User | null;

    isLoggedIn: boolean;   // ✅ session valid
    hydrated: boolean;    // ✅ auth flow completed

    setUser: (user: User) => void;
    markLoggedIn: () => void;
    clearAuth: () => void;
    markHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoggedIn: false,
    hydrated: false,

    setUser: (user) =>
        set({
            user,
            isLoggedIn: true,
        }),

    markLoggedIn: () =>
        set({
            isLoggedIn: true,
        }),

    clearAuth: () =>
        set({
            user: null,
            isLoggedIn: false,
            hydrated: true,
        }),

    markHydrated: () =>
        set({
            hydrated: true,
        }),
}));

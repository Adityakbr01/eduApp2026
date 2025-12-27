// store/auth.ts
import { User } from "@/services/auth";
import { create } from "zustand";


// interface MinimalUser {
//     userId: string;
//     roleId?: string;
//     permissions: string[];
// }
interface AuthState {
    user: User | null;
    hydrated: boolean;     // ✅ backend session check complete
    isLoggedIn: boolean;   // ✅ session valid hai ya nahi
    setUser: (user: User) => void;
    clearAuth: () => void;
    markHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    hydrated: false,
    isLoggedIn: false,

    setUser: (user) => {
        set({ user, isLoggedIn: true });
    },

    clearAuth: () => {
        set({ user: null, isLoggedIn: false });
    },

    markHydrated: () => {
        set({ hydrated: true });
    },
}));

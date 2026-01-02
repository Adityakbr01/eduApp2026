import { PermissionSummary, UserPermissionsPayload } from "@/services/users/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MyPermissionState {
    // Data
    rolePermissions: PermissionSummary[];
    customPermissions: PermissionSummary[];
    effectivePermissions: PermissionSummary[];
    message: string | null;

    // Loading & Error states
    isLoading: boolean;
    isError: boolean;
    error: Error | null;

    // Actions
    setPermissions: (payload: UserPermissionsPayload) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: Error | null) => void;
    reset: () => void;
}

const initialState = {
    rolePermissions: [],
    customPermissions: [],
    effectivePermissions: [],
    message: null,
    isLoading: false,
    isError: false,
    error: null,
};

export const useMyPermissionStore = create<MyPermissionState>()(
    devtools(
        (set) => ({
            ...initialState,

            setPermissions: (payload) =>
                set(
                    {
                        rolePermissions: payload.rolePermissions,
                        customPermissions: payload.customPermissions,
                        effectivePermissions: payload.effectivePermissions,
                        message: payload.message,
                        isLoading: false,
                        isError: false,
                        error: null,
                    },
                    false,
                    "setPermissions"
                ),

            setLoading: (isLoading) =>
                set({ isLoading }, false, "setLoading"),

            setError: (error) =>
                set(
                    {
                        isError: !!error,
                        error,
                        isLoading: false,
                    },
                    false,
                    "setError"
                ),

            reset: () => set(initialState, false, "reset"),
        }),
        { name: "my-permission-store" }
    )
);

// Selector hooks for optimized re-renders
export const useEffectivePermissions = () =>
    useMyPermissionStore((state) => state.effectivePermissions);

export const useRolePermissions = () =>
    useMyPermissionStore((state) => state.rolePermissions);

export const useCustomPermissions = () =>
    useMyPermissionStore((state) => state.customPermissions);

export const usePermissionsLoading = () =>
    useMyPermissionStore((state) => state.isLoading);

export const usePermissionsError = () =>
    useMyPermissionStore((state) => ({ isError: state.isError, error: state.error }));

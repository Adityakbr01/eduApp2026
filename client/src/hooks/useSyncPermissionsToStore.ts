import { useMyPermissionStore } from "@/store/myPermission";
import usersQueries from "@/services/users/queries";
import { useEffect } from "react";

/**
 * Hook that fetches user permissions via React Query and syncs them to Zustand store.
 * Use this hook once at a high level (e.g., layout or dashboard) to populate the global store.
 * Other components can then access permissions via useMyPermissionStore or selector hooks.
 */
export function useSyncPermissionsToStore() {
    const { data, isLoading, isError, error } = usersQueries.useGetMyRoleANDPermission();
    const { setPermissions, setLoading, setError } = useMyPermissionStore();

    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    useEffect(() => {
        if (isError && error) {
            setError(error);
        }
    }, [isError, error, setError]);

    useEffect(() => {
        if (data) {
            setPermissions(data);
        }
    }, [data, setPermissions]);

    return { data, isLoading, isError, error };
}

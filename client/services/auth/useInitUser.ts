import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useGetSession } from "./queries";

export const useInitUser = () => {
    const { setUser, clearAuth, markHydrated } = useAuthStore();
    const { isSuccess, isError, data } = useGetSession({ retry: false });

    useEffect(() => {
        if (isSuccess && data?.data) {
            setUser({
                userId: data.data.userId,
                actualRoleId: data.data.roleId,
                roleName: data.data.roleName,
                sessionId: data.data.sessionId,
            });
            markHydrated();
        }
    }, [isSuccess, data, setUser, markHydrated]);

    useEffect(() => {
        if (isError) {
            clearAuth();
            markHydrated();
        }
    }, [isError, clearAuth, markHydrated]);
};

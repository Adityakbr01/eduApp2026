import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { useGetCurrentUser, useGetSession } from "./queries";

export const useInitUser = () => {
    const { setUser, clearAuth, markHydrated } = useAuthStore();
    const { isSuccess, isError, data } = useGetSession();
     useGetCurrentUser();


    useEffect(() => {
        if (isSuccess && data?.data) {
            setUser({
                id: data.data.id,
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

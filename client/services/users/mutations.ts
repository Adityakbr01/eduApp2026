'use client';

import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ApiResult, ApproveUserPayload, ApproveUserResponse, AssignPermissionsPayload, AssignPermissionsResponse, DeletePermissionsPayload, DeletePermissionsResponse } from "./types";




const userApi = {
    approveUser: async (payload: ApproveUserPayload): Promise<ApproveUserResponse> => {
        const response = await api.post<ApproveUserResponse>(
            `/users/approved-user/${payload.userId}`,
            payload
        );

        return response.data;
    },
    banUser: async (payload: { userId: string }): Promise<ApiResult<null>> => {
        const response = await api.post(
            `/users/user-ban-unban/${payload.userId}`,
            payload
        );

        return response.data;
    },
    deleteUser: async (userId: string): Promise<ApiResult<null>> => {
        const response = await api.delete<ApiResult<null>>(
            `/users/${userId}`
        );
        return response.data;
    },
    assignPermissions: async (payload: AssignPermissionsPayload): Promise<AssignPermissionsResponse> => {
        const response = await api.post<AssignPermissionsResponse>(
            `/users/roles-permissions`,
            payload
        );
        return response.data;
    },
    deletePermissions: async (payload: DeletePermissionsPayload): Promise<DeletePermissionsResponse> => {
        const response = await api.delete<DeletePermissionsResponse>(
            `/users/roles-permissions`,
            { data: payload }
        );
        return response.data;
    }
};

// -----------------------------------------
// MUTATION HOOK
// -----------------------------------------
const useApproveUser = (
    options?: UseMutationOptions<
        ApproveUserResponse, // success response
        Error,               // error type
        ApproveUserPayload   // payload type
    >
) => {
    const queryClient = useQueryClient();

    return useMutation<
        ApproveUserResponse,
        Error,
        ApproveUserPayload
    >({
        mutationFn: userApi.approveUser,
        ...options,
        onSuccess: (api, variables, context) => {
            toast.success(api.message ?? "User approved successfully");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onSuccess?.(api, variables, context, undefined as never);
        },
        onError: (error, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onError?.(error, variables, context, undefined as never);
        },
    });
};

const useBanUser = (
    options?: UseMutationOptions<
        ApiResult<null>, // success response
        Error, // error type
        { userId: string } // payload type
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResult<null>,
        Error,
        { userId: string }
    >({
        mutationFn: userApi.banUser,
        ...options,
        onSuccess: (api, variables, context) => {
            toast.success(api.message ?? "User status updated");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onSuccess?.(api, variables, context, undefined as never);
        },
        onError: (error, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onError?.(error, variables, context, undefined as never);
        },
    });
};

const useDeleteUser = (
    options?: UseMutationOptions<
        ApiResult<null>, // success response
        Error, // error type
        string // userId type
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResult<null>,
        Error,
        string
    >({
        mutationFn: userApi.deleteUser,
        ...options,
        onSuccess: (api, variables, context) => {
            toast.success(api.message ?? "User deleted successfully");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onSuccess?.(api, variables, context, undefined as never);
        },
        onError: (error, variables, context) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            options?.onError?.(error, variables, context, undefined as never);
        },
    });
};

const useAssignPermissions = (
    options?: UseMutationOptions<
        AssignPermissionsResponse,
        Error,
        AssignPermissionsPayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<AssignPermissionsResponse, Error, AssignPermissionsPayload>({
        mutationFn: userApi.assignPermissions,
        ...options,
        onSuccess: (api, variables, context) => {
            toast.success(api.message ?? "Permission saved successfully");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL_ROLES_PERMISSIONS });
            if (variables?.userId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.DETAIL(variables.userId) });
            }
            options?.onSuccess?.(api, variables, context, undefined as never);
        },
    });
};

const useDeletePermissions = (
    options?: UseMutationOptions<
        DeletePermissionsResponse,
        Error,
        DeletePermissionsPayload
    >
) => {
    const queryClient = useQueryClient();
    return useMutation<DeletePermissionsResponse, Error, DeletePermissionsPayload>({
        mutationFn: userApi.deletePermissions,
        ...options,
        onSuccess: (api, variables, context) => {
            toast.success(api.message ?? "Permission removed successfully");
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.ALL] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL_ROLES_PERMISSIONS });
            if (variables?.userId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.DETAIL(variables.userId) });
            }
            options?.onSuccess?.(api, variables, context, undefined as never);
        },
    });
};


const userMutations = {
    useApproveUser,
    useBanUser,
    useDeleteUser,
    useAssignPermissions,
    useDeletePermissions,
};

export default userMutations;

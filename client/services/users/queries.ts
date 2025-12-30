import { QUERY_KEYS } from "@/config/query-keys";
import api from "@/lib/api/axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { User } from "../auth";
import type { RoleWithPermissions, RolesAndPermissionsPayload, UserPermissionsPayload } from "./types";


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    statusCode: number;
    path: string;
    timestamp: string;
    meta?: {
        pagination?: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        [key: string]: unknown;
    };
}


interface UsersApiResult {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export type UsersQueryParams = {
    page?: number;
    limit?: number;
};


const usersApi = {
    getUsers: async (params: UsersQueryParams = {}): Promise<UsersApiResult> => {
        const res = await api.get<ApiResponse<UsersApiResult>>("/users", { params });
        console.log("API Response:", res.data);
        return {
            users: res.data.data?.users || [],
            pagination: res.data.data?.pagination || res.data.meta?.pagination || {
                total: 0,
                page: params.page ?? 1,
                limit: params.limit ?? 10,
                totalPages: 0,
                hasNext: true,
                hasPrev: true,
            },
        };
    },
    getUserById: async (userId: string): Promise<User | null> => {
        const res = await api.get<ApiResponse<User>>(`/users/${userId}`);
        return res.data.data || null;
    },
    getAllRoleANDPermission: async (): Promise<RoleWithPermissions[]> => {
        const res = await api.get<ApiResponse<RolesAndPermissionsPayload>>(`/users/getAllRoleANDPermission`);
        return res.data.data?.data ?? [];
    },
    getMyRoleANDPermission: async (): Promise<UserPermissionsPayload> => {
        const res = await api.get<ApiResponse<{ data: UserPermissionsPayload }>>(
            `/users/getMyRoleANDPermission`
        );

        const payload = res?.data?.data?.data;

        if (!payload) {
            throw new Error("User permissions payload not found");
        }

        return payload;
    }

};


const useGetUsers = (
    params?: UsersQueryParams,
    options?: Omit<
        UseQueryOptions<UsersApiResult, Error>,
        "queryKey" | "queryFn"
    >,
) => {
    const queryParams = params ?? {};
    return useQuery<UsersApiResult, Error>({
        queryKey: [QUERY_KEYS.USERS.ALL, queryParams],
        queryFn: () => usersApi.getUsers(queryParams),
        staleTime: 2 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        ...options,
    });
};

const useGetUserById = (userId: string, options?: Omit<
    UseQueryOptions<User | null, Error>,
    "queryKey" | "queryFn"
>) => {
    return useQuery<User | null, Error>({
        queryKey: [QUERY_KEYS.USERS.DETAIL, userId],
        queryFn: () => usersApi.getUserById(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
}

const useGetAllRoleANDPermission = (options?: Omit<
    UseQueryOptions<RoleWithPermissions[], Error>,
    "queryKey" | "queryFn"
>) => {
    return useQuery<RoleWithPermissions[], Error>({
        queryKey: [QUERY_KEYS.USERS.ALL_ROLES_PERMISSIONS],
        queryFn: () => usersApi.getAllRoleANDPermission(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

const useGetMyRoleANDPermission = (
    options?: Omit<
        UseQueryOptions<UserPermissionsPayload, Error>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery<UserPermissionsPayload, Error>({
        queryKey: [QUERY_KEYS.USERS.MY_ROLES_PERMISSIONS],
        queryFn: () => usersApi.getMyRoleANDPermission(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

const usersQueries = {
    api: usersApi,
    useGetUsers,
    useGetUserById,
    useGetAllRoleANDPermission,
    useGetMyRoleANDPermission,
};

export default usersQueries;

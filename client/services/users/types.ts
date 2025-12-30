import { User } from "../auth";

// Single User object inside data.data
export interface ApprovedUser {
    approvedBy?: string | null;
    userId: string;
    name: string;
    email: string;
    roleId: string;
    isEmailVerified: boolean;
    phone: string;
    approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
    permissions: string[];
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface PermissionSummary {
    _id: string;
    code: string;
    description?: string;
}

export interface GetMyPermissionsResponse {
    user: User;
    customPermissions: PermissionSummary[];
    rolePermissions: PermissionSummary[];
}



export interface RoleWithPermissions {
    _id: string;
    name: string;
    description?: string;
    customPermissions?: PermissionSummary[];
    rolePermissions?: PermissionSummary[];
    permissions: PermissionSummary[];
}

export interface Permission {
    _id: string;
    code: string;
    description: string;
}


export interface UserPermissionsPayload {
    message: string;
    rolePermissions: Permission[];
    customPermissions: Permission[];
    effectivePermissions: Permission[];
}

export interface UserPermissionsResponse {
    rolePermissions: PermissionSummary[];
    customPermissions: PermissionSummary[];
}

export interface RolesAndPermissionsPayload {
    message: string;
    data: RoleWithPermissions[];
    rolePermissions: PermissionSummary[];
}

// API response structure
export interface ApproveUserResponse {
    success: boolean;
    message: string;
    data: {
        message: string;
        data: ApprovedUser;
    };
    meta: unknown | null;
    timestamp: string;
    path: string;
    statusCode: number;
}


// Payload you send to backend
export interface ApproveUserPayload {
    userId: string;
}

export interface PermissionMutationPayload {
    userId: string;
    permission: string[];
}

export type AssignPermissionsPayload = PermissionMutationPayload;
export type DeletePermissionsPayload = PermissionMutationPayload;



//All api response look like

export interface GenericApiResponse<T> {
    success: boolean;
    message: string;
    data: {
        message: string;
        data: T;
    };
    meta: unknown | null;
    timestamp: string;
    path: string;
    statusCode: number;
}


export type ApiResult<T> = {
    success: boolean;
    message: string;
    data: T;
    meta: unknown | null;
    timestamp: string;
    path: string;
    statusCode: number;
};

export type PermissionMutationResponse = ApiResult<{
    message: string;
    data: ApprovedUser;
}>;

export type AssignPermissionsResponse = PermissionMutationResponse;
export type DeletePermissionsResponse = PermissionMutationResponse;

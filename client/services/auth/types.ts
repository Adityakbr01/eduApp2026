import { PermissionSummary } from "../users/types";

// Auth Types
interface roleIdInterface {
    createdAt: string;
    description: string
    name: string
    updatedAt: string
    _id: string
}

export interface User {
    userId?: string;
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    roleId?: roleIdInterface;
    roleName?: string;
    isEmailVerified?: boolean;
    approvalStatus?: approvalStatusEnum | string;
    isBanned?: boolean;
    permissions?: PermissionSummary[];
    rolePermissions?: PermissionSummary[];
    customPermissions?: PermissionSummary[];
    effectivePermissions?: PermissionSummary[];
    address?: string;
    createdAt?: string;
    updatedAt?: string;
    approvedBy?: string | null;
    sessionId?: string;
    actualRoleId?: string;
    enrolledCourses?: EnrolledCourse[];
}



// Request Types
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role: string;
    instructorProfile?: {
        bio?: string;
        expertise?: string[];
        experience?: number;
    };
    managerProfile?: {
        department?: string;
        teamSize?: number;
    };
    supportTeamProfile?: {
        shiftTimings?: string;
        expertiseAreas?: string[];
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface VerifyRegisterOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyResetPasswordOtpRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}


interface EnrolledCourse {
    courseId: string;
    enrollmentId: string;
    purchasedAt: number;
}



// Response Types
export interface AuthResponse {
    message: string;
    id?: string;
    name?: string;
    roleId: roleIdInterface;
    roleName?: string;
    phone?: string,
    email?: string;
    isEmailVerified?: boolean;
    permissions?: string[];
    approvalStatus?: approvalStatusEnum;
    accessToken?: string;
    refreshToken?: string;
    enrolledCourses?: EnrolledCourse[];

}

export interface UserProfileResponse {
    message: string;
    user: User;
}

export interface OtpResponse {
    message?: string;
    meta?: {
        otpExpiry: string;
    };
    success?: boolean;
    statusCode?: number;
}

export enum approvalStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    setAccessToken: (token: string | null) => void;
    setUser: (user: User) => void;
    clearAuth: () => void;
}


export interface SessionResponse {
    sessionId: string;
    userId: string;

    role: {
        id: string;
        name: string;
    };

    permissions: string[];        // effective permissions (role + extra)
    extraPermissions?: string[];  // optional – user overrides

    issuedAt: number;   // epoch ms
    expiresAt: number;  // epoch ms
}


export interface SessionData {
    isAuthenticated: boolean,
    sessionId: string,
    roleName: string,
    roleId: string
    id: string,
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    meta: {
        statusCode: number;
    };
}

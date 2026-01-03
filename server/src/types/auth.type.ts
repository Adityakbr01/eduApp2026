import type { Types } from "mongoose";

// Request body types
export interface EmailBody { email: string }
export interface OtpVerifyBody { email: string; otp: string }
export interface LoginBody { email: string; password: string }
export interface ResetPassBody { email: string; otp: string; newPassword: string }
export interface ChangePassBody { currentPassword: string; newPassword: string }
export interface RefreshTokenBody { refreshToken?: string }




export type PermissionDTO = {
    _id: string;
    code: string;
    description?: string;
};

export type PopulatedRole = {
    _id: Types.ObjectId;
    name: string;

};

export type UserWithRole = {
    _id: Types.ObjectId;
    name: string;
    email: string;
    roleId: PopulatedRole;
    isEmailVerified: boolean;
    approvalStatus: string;
    isBanned: boolean;
    phone?: string;
    permissions?: string[];
};


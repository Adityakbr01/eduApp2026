import type { Types } from "mongoose";
import type { PermissionSummary } from "src/helpers/getUserExtraPermissions.js";
import type { PermissionDTO, PopulatedRole } from "./auth.type.js";

export enum approvalStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface InstructorProfile {
    bio?: string;
    expertise?: string[];
    experience?: number;
}

export interface StudentProfile {
    enrolledCourses?: string[];
    progress?: Record<string, number>; // courseId -> progress
}

export interface ManagerProfile {
    department?: string;
    teamSize?: number;
}

export interface SupportTeamProfile {
    shiftTimings?: string;
    expertiseAreas?: string[];
}

export interface IUser {
    _id: Types.ObjectId
    name: string;
    email: string;
    password: string;
    roleId: Types.ObjectId | PopulatedRole;

    verifyOtp?: string;
    verifyOtpExpiry?: Date;

    isEmailVerified: boolean;
    phone?: string;
    address?: string;

    approvalStatus?: approvalStatusEnum;
    approvedBy?: Types.ObjectId;

    permissions?: string[];

    isBanned: boolean;
    bannedBy?: Types.ObjectId;
    instructorProfile?: InstructorProfile;
    studentProfile?: StudentProfile;
    managerProfile?: ManagerProfile;
    supportTeamProfile?: SupportTeamProfile;

    comparePassword: (password: string) => Promise<boolean>;
    generateAccessToken: (sessionId: string, roleName: string) => string;
}

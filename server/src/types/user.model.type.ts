import type { Types } from "mongoose";
import type { PopulatedRole } from "./auth.type.js";

export enum approvalStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum ProfessionEnum {
    STUDENT = "student",
    PROFESSIONAL = "professional",
    FREELANCER = "freelancer",
    ENTREPRENEUR = "entrepreneur",
    JOB_SEEKER = "job_seeker",
}

export interface VersionedAsset {
    key: string;
    version: number;
    updatedAt?: Date;
}

export interface UserProfile {
    // Personal Info
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    bio?: string;
    avatar?: VersionedAsset;

    // Location
    city?: string;
    state?: string;
    country?: string;

    // Professional
    profession?: ProfessionEnum;
    organization?: string;
    resume?: VersionedAsset;
    linkedinUrl?: string;
    githubUrl?: string;
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

    isEmailVerified: boolean;
    phone?: string;
    address?: string;

    // User Profile (personal, professional info)
    profile?: UserProfile;

    // OAuth Fields
    googleId?: string;
    githubId?: string;
    authProvider?: ("local" | "google" | "github")[];

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

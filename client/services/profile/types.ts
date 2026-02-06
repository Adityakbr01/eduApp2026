// Profile Types

export type ProfessionType = 
  | "student" 
  | "professional" 
  | "freelancer" 
  | "entrepreneur" 
  | "job_seeker";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    bio?: string;
    avatarUrl?: string;
    avatarVersion?: number;
    city?: string;
    state?: string;
    country?: string;
    profession?: ProfessionType;
    organization?: string;
    resumeUrl?: string;
    resumeVersion?: number;
    linkedinUrl?: string;
    githubUrl?: string;
  };
}

export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  profession?: ProfessionType;
  organization?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface ProfileImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
    key: string;
    publicUrl: string;
    version: number;
  };
}

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
    key: string;
    publicUrl: string;
    version: number;
    filename?: string;
  };
}

export interface ConfirmUploadPayload {
  key: string;
  type: "avatar" | "resume";
  version: number;
  filename?: string;
}

export interface ConfirmUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    version: number;
  };
}

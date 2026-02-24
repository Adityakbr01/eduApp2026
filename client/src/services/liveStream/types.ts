import { AdminCourse } from "../courses";
import { ApiResponse } from "../auth";
import apiClient from "@/lib/api/axios";

// ==================== LIVE STREAM ACCESS TYPES ====================

export type LiveStreamAccessStatus = "pending" | "approved" | "rejected" | "none";

export interface ILiveStreamAccessRequest {
    _id: string;
    instructorId: {
        _id: string;
        name: string;
        email: string;
    };
    status: LiveStreamAccessStatus;
    processedBy?: {
        _id: string;
        name: string;
    };
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LiveStreamAccessRequestResponse {
    requests: ILiveStreamAccessRequest[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ==================== EXTEND EXISTING TYPES ====================
export interface ILiveStream {
    _id: string;
    title: string;
    description: string;
    courseId: string;
    lessonId: string;
    instructorId: string;
    liveId: string;
    serverUrl?: string; // Made optional since students don't get this
    streamKey?: string; // Made optional
    status: "scheduled" | "live" | "ended";
    scheduledAt?: string;
    autoSaveRecording: boolean;
    recordingTitle: string;
    recordingDescription: string;
    viewerCount?: number;
    createdAt: string;
    updatedAt: string;
    recordingProcessed?: boolean;
    otp?: string;
    chatSecret?: string;
    playerEmbedCode?: string;
    chatEmbedCode?: string;
    chatUrl?: string;
    chatToken?: string | null;
}

export interface LiveStreamCredentials {
    serverUrl: string;
    streamKey: string;
    playerEmbedCode?: string;
}

export interface CreateLiveSessionDTO {
    courseId: string;
    lessonId: string;
    recordingTitle: string;
    recordingDescription?: string;
    scheduledAt?: string;
    autoSaveRecording: boolean;
    // Manual credentials
    liveId: string;
    serverUrl: string;
    streamKey: string;
    chatSecret?: string;
    chatEmbedCode?: string;
    playerEmbedCode?: string;
}

export interface CreateLiveSessionResponse {
    message: string;
    liveId: string;
    serverUrl?: string;
    streamKey?: string;
}

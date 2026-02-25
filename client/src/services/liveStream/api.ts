import apiClient from "@/lib/api/axios";
import { ApiResponse } from "../auth";
import {
    CreateLiveSessionDTO,
    CreateLiveSessionResponse,
    ILiveStream,
    LiveStreamCredentials,
    ILiveStreamAccessRequest,
    LiveStreamAccessStatus,
    LiveStreamAccessRequestResponse,
} from "./types";

// ==================== BASE PATH ====================
const LIVE_STREAM_BASE = "/live-streams";

export const liveStreamApi = {
    // ==================== ACCESS REQUESTS ====================

    /**
     * Request VdoCipher access (instructor)
     */
    requestAccess: async (): Promise<ApiResponse<ILiveStreamAccessRequest>> => {
        const response = await apiClient.post(`${LIVE_STREAM_BASE}/access-request`);
        return response.data;
    },

    /**
     * Check VdoCipher access status (instructor)
     */
    getAccessStatus: async (): Promise<ApiResponse<{ status: LiveStreamAccessStatus }>> => {
        const response = await apiClient.get(`${LIVE_STREAM_BASE}/access-request/status`);
        return response.data;
    },

    /**
     * List access requests (admin)
     */
    getAccessRequests: async (
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<ApiResponse<LiveStreamAccessRequestResponse>> => {
        const params: any = { page, limit };
        if (status) params.status = status;

        const response = await apiClient.get(`${LIVE_STREAM_BASE}/admin/access-requests`, { params });
        return response.data;
    },

    /**
     * Process access request (admin)
     */
    processAccessRequest: async (
        requestId: string,
        status: "approved" | "rejected"
    ): Promise<ApiResponse<ILiveStreamAccessRequest>> => {
        const response = await apiClient.patch(
            `${LIVE_STREAM_BASE}/admin/access-requests/${requestId}`,
            { status }
        );
        return response.data;
    },

    // ==================== LIVE STREAM API ====================

    /**
     * Create a new live session (instructor)
     */
    createLiveSession: async (
        data: CreateLiveSessionDTO
    ): Promise<ApiResponse<CreateLiveSessionResponse>> => {
        const response = await apiClient.post(LIVE_STREAM_BASE, data);
        return response.data;
    },

    /**
     * Get instructor's live streams (optionally filtered by courseId)
     */
    getInstructorStreams: async (
        courseId?: string,
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<ApiResponse<ILiveStream[]>> => {
        const params: any = { page, limit };
        if (courseId && courseId !== "all") params.courseId = courseId;
        if (status && status !== "all") params.status = status;

        const response = await apiClient.get(`${LIVE_STREAM_BASE}/instructor`, {
            params,
        });
        return response.data;
    },

    /**
     * Get the currently active live stream for a student's enrolled course
     */
    getStudentLiveStream: async (
        courseId: string
    ): Promise<ApiResponse<ILiveStream & { viewerCount?: number; otp?: any }>> => {
        const response = await apiClient.get(`${LIVE_STREAM_BASE}/student/course/${courseId}`);
        return response.data;
    },

    /**
     * Get RTMP credentials for a specific stream
     */
    getStreamCredentials: async (
        streamId: string
    ): Promise<ApiResponse<LiveStreamCredentials>> => {
        const response = await apiClient.get(
            `${LIVE_STREAM_BASE}/instructor/${streamId}/credentials`
        );
        return response.data;
    },

    /**
     * Update live stream status (e.g. going live, ending stream)
     */
    updateStreamStatus: async (
        streamId: string,
        status: "live" | "ended"
    ): Promise<ApiResponse<ILiveStream>> => {
        const response = await apiClient.patch(
            `${LIVE_STREAM_BASE}/instructor/${streamId}/status`,
            { status }
        );
        return response.data;
    },

    /**
     * Enable live streaming for a course (admin)
     */
    enableLiveStreaming: async (
        courseId: string
    ): Promise<ApiResponse<{ courseId: string; liveStreamingEnabled: boolean }>> => {
        const response = await apiClient.patch(
            `${LIVE_STREAM_BASE}/courses/${courseId}/enable`
        );
        return response.data;
    },

    /**
     * Disable live streaming for a course (admin)
     */
    disableLiveStreaming: async (
        courseId: string
    ): Promise<ApiResponse<{ courseId: string; liveStreamingEnabled: boolean }>> => {
        const response = await apiClient.patch(
            `${LIVE_STREAM_BASE}/courses/${courseId}/disable`
        );
        return response.data;
    },
};

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { liveStreamApi } from "./api";
import { ApiResponse } from "../auth";
import {
    ILiveStream,
    LiveStreamCredentials,
    LiveStreamAccessStatus,
    LiveStreamAccessRequestResponse,
} from "./types";

// ==================== ACCESS REQUEST QUERIES ====================

export const useGetAccessStatus = (
    options?: Omit<
        UseQueryOptions<ApiResponse<{ status: LiveStreamAccessStatus }>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.CREDENTIALS, "access-status"],
        queryFn: () => liveStreamApi.getAccessStatus(),
        ...options,
    });
};

export const useGetAccessRequests = (
    page: number = 1,
    limit: number = 10,
    status?: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<LiveStreamAccessRequestResponse>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.ADMIN_ALL, "requests", page, limit, status],
        queryFn: () => liveStreamApi.getAccessRequests(page, limit, status),
        ...options,
    });
};

// ==================== INSTRUCTOR LIVE STREAM QUERIES ====================

/**
 * Get instructor's live streams (optionally filtered by courseId)
 */
export const useGetInstructorLiveStreams = (
    courseId?: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<ILiveStream[]>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.INSTRUCTOR_LIST, courseId, page, limit, status],
        queryFn: () => liveStreamApi.getInstructorStreams(courseId, page, limit, status),
        ...options,
    });
};

/**
 * Get RTMP credentials for a stream
 */
export const useGetStreamCredentials = (
    streamId: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<LiveStreamCredentials>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.CREDENTIALS, streamId],
        queryFn: () => liveStreamApi.getStreamCredentials(streamId),
        enabled: !!streamId,
        ...options,
    });
};

// ==================== STUDENT LIVE STREAM QUERIES ====================

/**
 * Get active live stream for a student in a course
 */
export const useGetStudentLiveStream = (
    courseId: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<ILiveStream & { viewerCount?: number; otp?: any }>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LIVE_STREAMS.STUDENT_ACTIVE, courseId],
        queryFn: async () => {
            try {
                console.log("[react-query] Fetching useGetStudentLiveStream for course:", courseId);
                const res = await liveStreamApi.getStudentLiveStream(courseId);
                console.log("[react-query] getStudentLiveStream payload:", res);
                return res;
            } catch (err) {
                console.error("[react-query] getStudentLiveStream ERROR:", err);
                throw err;
            }
        },
        enabled: !!courseId,
        retry: false, // Don't retry if it 404s so we can see the error
        ...options,
    });
};

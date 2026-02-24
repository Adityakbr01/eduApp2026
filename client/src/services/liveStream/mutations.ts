import { QUERY_KEYS } from "@/config/query-keys";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { liveStreamApi } from "./api";
import { CreateLiveSessionDTO } from "./types";

// ==================== LIVE STREAM MUTATIONS ====================

/**
 * Create a new live session
 */
export const useCreateLiveSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLiveSessionDTO) =>
            liveStreamApi.createLiveSession(data),
        onSuccess: (response) => {
            mutationHandlers.success(
                response.message || "Live session created successfully"
            );
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LIVE_STREAMS.INSTRUCTOR_LIST],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update the status of a live stream (e.g., from scheduled to live)
 */
export const useUpdateStreamStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ streamId, status }: { streamId: string; status: "live" | "ended" }) =>
            liveStreamApi.updateStreamStatus(streamId, status),
        onSuccess: (response) => {
            mutationHandlers.success(
                response.message || "Stream status updated successfully"
            );
            // Invalidate the instructor list so the UI refreshes the badge
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LIVE_STREAMS.INSTRUCTOR_LIST],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

// ==================== ADMIN MUTATIONS ====================

/**
 * Toggle live streaming for a course (admin)
 */
export const useToggleLiveStreaming = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            courseId,
            enable,
        }: {
            courseId: string;
            enable: boolean;
        }) =>
            enable
                ? liveStreamApi.enableLiveStreaming(courseId)
                : liveStreamApi.disableLiveStreaming(courseId),
        onSuccess: (response) => {
            mutationHandlers.success(
                response.message || "Live streaming toggled successfully"
            );
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.ADMIN_ALL],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

// ==================== ACCESS REQUEST MUTATIONS ====================

/**
 * Request VdoCipher access (instructor)
 */
export const useRequestAccess = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => liveStreamApi.requestAccess(),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Access requested");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LIVE_STREAMS.CREDENTIALS, "access-status"],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Process access request (admin)
 */
export const useProcessAccessRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            status,
        }: {
            requestId: string;
            status: "approved" | "rejected";
        }) => liveStreamApi.processAccessRequest(requestId, status),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Request processed");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.LIVE_STREAMS.ADMIN_ALL, "requests"],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

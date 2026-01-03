import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadApi } from "./api";
import { UploadProgress } from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";

// Helper to create a simple error handler
const handleMutationError = (error: unknown) => {
    mutationHandlers.error(error);
};

// ==================== UPLOAD MUTATIONS ====================

/**
 * Upload course cover image
 */
export const useUploadCourseImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            onProgress,
        }: {
            file: File;
            onProgress?: (progress: UploadProgress) => void;
        }) => uploadApi.uploadCourseImage(file, onProgress),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "Image uploaded successfully");
            // Invalidate instructor courses to reflect new image
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
            });
        },
        onError: handleMutationError,
    });
};

/**
 * Upload lesson video
 */
export const useUploadLessonVideo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            onProgress,
        }: {
            file: File;
            onProgress?: (progress: UploadProgress) => void;
        }) => uploadApi.uploadLessonVideo(file, onProgress),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "Video uploaded successfully");
        },
        onError: handleMutationError,
    });
};

/**
 * Upload lesson document (PDF)
 */
export const useUploadLessonDocument = () => {
    return useMutation({
        mutationFn: ({
            file,
            onProgress,
        }: {
            file: File;
            onProgress?: (progress: UploadProgress) => void;
        }) => uploadApi.uploadLessonDocument(file, onProgress),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "Document uploaded successfully");
        },
        onError: handleMutationError,
    });
};

/**
 * Upload any lesson content (auto-detect type)
 */
export const useUploadLessonContent = () => {
    return useMutation({
        mutationFn: ({
            file,
            onProgress,
        }: {
            file: File;
            onProgress?: (progress: UploadProgress) => void;
        }) => uploadApi.uploadLessonContent(file, onProgress),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "Content uploaded successfully");
        },
        onError: handleMutationError,
    });
};

/**
 * Delete an uploaded file
 */
export const useDeleteUpload = () => {
    return useMutation({
        mutationFn: (publicId: string) => uploadApi.deleteUpload(publicId),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "File deleted successfully");
        },
        onError: handleMutationError,
    });
};

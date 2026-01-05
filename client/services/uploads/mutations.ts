import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadApi } from "./api";
import { FileTypeEnum, UploadProgress } from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";
import { uploadFileToS3 } from "@/lib/s3/uploadSDK";

// Helper to create a simple error handler
const handleMutationError = (error: unknown) => {
    mutationHandlers.error(error);
};

// ==================== S3 PRESIGNED URL UPLOAD ====================

/**
 * Upload file directly to S3 using presigned URLs
 * This is the preferred method for large files
 */
export const useS3Upload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            fileType,
            onProgress,
        }: {
            file: File;
            fileType: FileTypeEnum;
            onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
        }) => uploadFileToS3({ file, fileType, onProgress }),
        onSuccess: () => {
            mutationHandlers.success("File uploaded successfully");
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
            });
        },
        onError: handleMutationError,
    });
};

// ==================== LEGACY UPLOAD MUTATIONS (via server) ====================

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
 * Upload lesson audio
 */
export const useUploadLessonAudio = () => {
    return useMutation({
        mutationFn: ({
            file,
            onProgress,
        }: {
            file: File;
            onProgress?: (progress: UploadProgress) => void;
        }) => uploadApi.uploadLessonAudio(file, onProgress),
        onSuccess: (data) => {
            mutationHandlers.success(data.message || "Audio uploaded successfully");
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

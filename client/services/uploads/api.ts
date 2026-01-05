import apiClient from "@/lib/api/axios";
import { ApiResponse } from "../auth";
import { DeleteUploadResponse, FileTypeEnum, UploadProgress, UploadResponse } from "./types";


type UploadMode =
    | { mode: "simple"; uploadUrl: string }
    | { mode: "multipart" };


export type PresignedUploadResponse = {
    mode: "simple" | "multipart";
    intentId: string;
    uploadUrl?: string;
    key: string;
};


// ==================== UPLOAD API ====================

export const uploadApi = {
    /**
     * Get a presigned URL for direct S3 upload
     */
    getPresignedUrl: async (
        filename: string,
        fileType: FileTypeEnum,
        fileSize: number,
        mimeType: string
    ): Promise<{
        mode: "simple" | "multipart";
        intentId: string;
        uploadUrl?: string;
        key: string;
    }> => {
        const response = await apiClient.post<ApiResponse<PresignedUploadResponse>>(
            "/upload/presigned-url",
            {
                filename,
                fileType,
                fileSize,
                mimeType,
            },
        );
        return response.data.data;
    },

    /**
     * Initialize a multipart upload
     */
    initMultipart: async (intentId: string): Promise<{
        uploadId: string;
        partSize: number;
        totalParts: number;
    }> => {
        const response = await apiClient.post<{
            uploadId: string;
            partSize: number;
            totalParts: number;
        }>("/upload/multipart/init", { intentId });
        return response.data;
    },

    /**
     * Get a signed URL for uploading a specific part
     */
    signPart: async (
        intentId: string,
        uploadId: string,
        partNumber: number
    ): Promise<string> => {
        const response = await apiClient.post<{ url: string }>(
            "/upload/multipart/sign-part",
            { intentId, uploadId, partNumber }
        );
        return response.data.url;
    },

    /**
     * Complete a multipart upload
     */
    completeMultipart: async (
        intentId: string,
        uploadId: string,
        parts: { PartNumber: number; ETag: string }[]
    ): Promise<{ key: string }> => {
        const response = await apiClient.post<{ key: string }>(
            "/upload/multipart/complete",
            { intentId, uploadId, parts }
        );
        return response.data;
    },

    /**
     * Complete an upload (finalize and move from temp to permanent storage)
     */
    completeUpload: async (intentId: string): Promise<{ finalKey: string; url: string }> => {
        const response = await apiClient.post<{ finalKey: string; url: string }>(
            "/upload/complete",
            { intentId }
        );
        return response.data;
    },

    /**
     * Upload a course cover image
     * @param file - Image file (max 5MB, jpg/png/gif/webp)
     * @param onProgress - Optional progress callback
     */
    uploadCourseImage: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/course-image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000, // 1 minute for images
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                        });
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Upload a lesson video
     * @param file - Video file (max 500MB, mp4/webm/mov/avi/mkv/m4v)
     * @param onProgress - Optional progress callback
     */
    uploadLessonVideo: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("video", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/lesson-video",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 600000, // 10 minutes for large videos
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                        });
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Upload a lesson document (PDF)
     * @param file - PDF file (max 20MB)
     * @param onProgress - Optional progress callback
     */
    uploadLessonDocument: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("document", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/lesson-document",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 120000, // 2 minutes for documents
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                        });
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Upload lesson audio
     * @param file - Audio file (max 100MB, mp3/wav/ogg/aac/m4a/webm/flac)
     * @param onProgress - Optional progress callback
     */
    uploadLessonAudio: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("audio", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/lesson-audio",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 300000, // 5 minutes for audio files
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                        });
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Upload any lesson content (auto-detect type)
     * @param file - Any supported file (image/video/pdf)
     * @param onProgress - Optional progress callback
     */
    uploadLessonContent: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/lesson-content",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 600000, // 10 minutes for large files
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        onProgress({
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                        });
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Delete an uploaded file from Cloudinary
     * @param publicId - The public ID of the file to delete
     */
    deleteUpload: async (publicId: string): Promise<DeleteUploadResponse> => {
        const response = await apiClient.delete<DeleteUploadResponse>(
            `/upload/${encodeURIComponent(publicId)}`
        );
        return response.data;
    },
};

export default uploadApi;

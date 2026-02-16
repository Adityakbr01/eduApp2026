import apiClient from "@/lib/api/axios";
import { FileTypeEnum } from "./types";



export type PresignedUploadResponse =
    | {
        mode: "simple";
        intentId: string;
        uploadUrl: string;
        rawKey: string;
        version: number;
    }
    | {
        mode: "multipart";
        intentId: string;
        rawKey: string;
    };


// ==================== UPLOAD API ====================

export const uploadApi = {
    getCourseImagePresignedUrl: async (
        filename: string,
        size: number,
        mimeType: string, // ✅ REAL MIME
        courseId: string
    ): Promise<PresignedUploadResponse> => {
        const res = await apiClient.post(
            "/upload/course/presigned-url/image",
            {
                filename,
                size,
                type: mimeType, // backend expects this
                courseId,
            }
        );
        return res.data.data;
    },


    getLessonVideoPresignedUrl: async (
        file: File,
        courseId: string,
        lessonId: string,
        lessonContentId: string
    ): Promise<PresignedUploadResponse> => {
        const res = await apiClient.post(
            "/upload/course/lesson/presigned-url/video",
            {
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                courseId,
                lessonId,
                lessonContentId,
            }
        );
        return res.data.data;
    },




    /**
     * Get a presigned URL for direct S3 upload
     */
    getPresignedUrl: async (
        filename: string,
        size: number,
        type: FileTypeEnum,
        key: string | undefined
    ): Promise<PresignedUploadResponse> => {
        const res = await apiClient.post("/upload/presigned-url", {
            filename,
            size,
            type,
            key,
        });
        return res.data.data;
    },

    /**
     * Initialize a multipart upload
     */
    initMultipart: async (
        intentId: string,
        size: number
    ): Promise<{
        uploadId: string;
        partSize: number;
        totalParts: number;
    }> => {
        const response = await apiClient.post("/upload/multipart/init", {
            intentId,
            size,
        });
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


    // ==================== VIDEO UPLOAD with VDOCipher ====================

    uploadVideoWithVdocipher: async (
        file: File,
        courseId: string,
        lessonId: string,
        lessonContentId: string,
        onProgress?: (percent: number) => void
    ): Promise<{ videoId: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", courseId);
        formData.append("lessonId", lessonId);
        formData.append("lessonContentId", lessonContentId);

        const response = await apiClient.post(
            "/upload/course/lesson/video",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
                        );
                        onProgress(percentCompleted);
                    }
                },
                timeout: 1000000, // 1000 seconds
            }
        );
        return response.data.data;
    },

};

export default uploadApi;

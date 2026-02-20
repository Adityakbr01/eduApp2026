// Upload Response Types

export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        publicId: string;
        resourceType: "image" | "video" | "raw";
        format?: string;
        width?: number;
        height?: number;
        duration?: number;
        bytes?: number;
    };
}

export interface DeleteUploadResponse {
    success: boolean;
    message: string;
}

export type UploadType = "course-image" | "lesson-video" | "lesson-document" | "lesson-content";

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}


export const FileType = {
    IMAGE: "image",
    VIDEO: "video",
    DOCUMENT: "document",
    AUDIO: "audio",
} as const;

export type FileTypeEnum = typeof FileType[keyof typeof FileType];

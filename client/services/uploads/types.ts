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
    PROFILE_IMAGE: "profile_image",
    COURSE_THUMBNAIL: "course_thumbnail",
    LESSON_VIDEO: "lesson_video",
    LESSON_AUDIO: "lesson_audio",
    LESSON_PDF: "lesson_pdf",
} as const;

export type FileTypeEnum = typeof FileType[keyof typeof FileType];

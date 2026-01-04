import multer from "multer";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import cloudinary from "src/configs/cloudinary.js";
import AppError from "./AppError.js";


// ==================== MULTER CONFIG ====================

// Memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter for different upload types
const imageFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
};

const videoFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only MP4, WebM, MOV, and AVI videos are allowed."));
    }
};

const audioFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        "audio/mpeg",      // MP3
        "audio/mp3",       // MP3 alternate
        "audio/wav",       // WAV
        "audio/wave",      // WAV alternate
        "audio/x-wav",     // WAV alternate
        "audio/ogg",       // OGG
        "audio/aac",       // AAC
        "audio/m4a",       // M4A
        "audio/x-m4a",     // M4A alternate
        "audio/mp4",       // MP4 audio
        "audio/webm",      // WebM audio
        "audio/flac",      // FLAC
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only MP3, WAV, OGG, AAC, M4A, WebM, and FLAC audio files are allowed."));
    }
};

const documentFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF and Word documents are allowed."));
    }
};

const lessonContentFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        // Images
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
        // Videos
        "video/mp4", "video/webm", "video/quicktime",
        // Audio
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav",
        "audio/ogg", "audio/aac", "audio/m4a", "audio/x-m4a", "audio/mp4",
        "audio/webm", "audio/flac",
        // Documents
        "application/pdf",
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images, videos, audio files, and PDF documents are allowed."));
    }
};

// ==================== MULTER INSTANCES ====================

// For course cover images (max 5MB)
export const uploadCourseImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// For lesson videos (max 500MB)
export const uploadLessonVideo = multer({
    storage,
    fileFilter: videoFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// For lesson documents (max 20MB)
export const uploadLessonDocument = multer({
    storage,
    fileFilter: documentFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// For lesson audio (max 100MB)
export const uploadLessonAudio = multer({
    storage,
    fileFilter: audioFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// For any lesson content (max 500MB)
export const uploadLessonContent = multer({
    storage,
    fileFilter: lessonContentFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// ==================== CLOUDINARY UPLOAD HELPERS ====================

export interface UploadResult {
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
    duration?: number;
    width?: number;
    height?: number;
    bytes: number;
}

// Upload image to Cloudinary
export const uploadImageToCloudinary = async (
    buffer: Buffer,
    folder: string,
    fileName?: string
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `eduapp/${folder}`,
                resource_type: "image",
                public_id: fileName,
                transformation: [
                    { quality: "auto:best" },
                    { fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(new AppError(
                        error.message || "Failed to upload image",
                        STATUSCODE.BAD_REQUEST,
                        ERROR_CODE.INVALID_INPUT
                    ));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        resourceType: result.resource_type,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                    });
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// Upload video to Cloudinary
export const uploadVideoToCloudinary = async (
    buffer: Buffer,
    folder: string,
    fileName?: string
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `eduapp/${folder}`,
                resource_type: "video",
                public_id: fileName,
                eager: [
                    { streaming_profile: "full_hd", format: "m3u8" }, // HLS streaming
                ],
                eager_async: true,
            },
            (error, result) => {
                if (error) {
                    reject(new AppError(
                        error.message || "Failed to upload video",
                        STATUSCODE.BAD_REQUEST,
                        ERROR_CODE.INVALID_INPUT
                    ));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        resourceType: result.resource_type,
                        duration: result.duration,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                    });
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// Upload document/PDF to Cloudinary
export const uploadDocumentToCloudinary = async (
    buffer: Buffer,
    folder: string,
    fileName?: string
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `eduapp/${folder}`,
                resource_type: "raw",
                public_id: fileName,
            },
            (error, result) => {
                if (error) {
                    reject(new AppError(
                        error.message || "Failed to upload document",
                        STATUSCODE.BAD_REQUEST,
                        ERROR_CODE.INVALID_INPUT
                    ));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format || "pdf",
                        resourceType: result.resource_type,
                        bytes: result.bytes,
                    });
                }
            }
        );
        uploadStream.end(buffer);
    });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error("Failed to delete file from Cloudinary:", error);
    }
};

// Auto-detect and upload based on mimetype
export const uploadFileToCloudinary = async (
    buffer: Buffer,
    mimetype: string,
    folder: string,
    fileName?: string
): Promise<UploadResult> => {
    if (mimetype.startsWith("image/")) {
        return uploadImageToCloudinary(buffer, folder, fileName);
    } else if (mimetype.startsWith("video/")) {
        return uploadVideoToCloudinary(buffer, folder, fileName);
    } else {
        return uploadDocumentToCloudinary(buffer, folder, fileName);
    }
};

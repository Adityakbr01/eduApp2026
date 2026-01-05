import type { Request, Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import { UploadService } from "src/services/upload-service/upload.service.js";
import AppError from "src/utils/AppError.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import {
    deleteFromCloudinary,
    uploadDocumentToCloudinary,
    uploadFileToCloudinary,
    uploadImageToCloudinary,
    uploadVideoToCloudinary,
} from "../utils/upload.js";

export const uploadController = {

    getPresignedUrl: catchAsync(async (req: Request, res: Response) => {
        const { filename, fileType, fileSize, mimeType } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("User not authenticated", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
        }

        if (!filename || !fileType || !fileSize || !mimeType) {
            throw new AppError(
                "Filename, fileType, fileSize, and mimeType are required",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        const result = await UploadService.getPresignedUrl({
            userId,
            filename,
            fileType,
            fileSize,
            mimeType,
        });

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),




    /**
     * @desc    Upload course cover image
     * @route   POST /api/v1/upload/course-image
     * @access  Private (Instructor, Admin)
     */
    uploadCourseImage: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("No image file provided", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT);
        }

        const result = await uploadImageToCloudinary(
            req.file.buffer,
            "courses/covers",
            `course-${Date.now()}`
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            width: result.width,
            height: result.height,
        });
    }),

    /**
     * @desc    Upload lesson video
     * @route   POST /api/v1/upload/lesson-video
     * @access  Private (Instructor, Admin)
     */
    uploadLessonVideo: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("No video file provided", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT);
        }

        const result = await uploadVideoToCloudinary(
            req.file.buffer,
            "courses/lessons/videos",
            `lesson-video-${Date.now()}`
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            duration: result.duration,
            width: result.width,
            height: result.height,
        });
    }),

    /**
     * @desc    Upload lesson document (PDF)
     * @route   POST /api/v1/upload/lesson-document
     * @access  Private (Instructor, Admin)
     */
    uploadLessonDocument: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("No document file provided", STATUSCODE.BAD_REQUEST, ERROR_CODE.BAD_REQUEST);
        }

        const result = await uploadDocumentToCloudinary(
            req.file.buffer,
            "courses/lessons/documents",
            `lesson-doc-${Date.now()}`
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
        });
    }),

    /**
     * @desc    Upload lesson audio
     * @route   POST /api/v1/upload/lesson-audio
     * @access  Private (Instructor, Admin)
     */
    uploadLessonAudio: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("No audio file provided", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT);
        }

        const result = await uploadVideoToCloudinary(
            req.file.buffer,
            "courses/lessons/audio",
            `lesson-audio-${Date.now()}`
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            duration: result.duration,
        });
    }),

    /**
     * @desc    Upload any lesson content (auto-detect type)
     * @route   POST /api/v1/upload/lesson-content
     * @access  Private (Instructor, Admin)
     */
    uploadLessonContent: catchAsync(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("No file provided", STATUSCODE.BAD_REQUEST, ERROR_CODE.BAD_REQUEST);
        }

        const result = await uploadFileToCloudinary(
            req.file.buffer,
            req.file.mimetype,
            "courses/lessons/content",
            `content-${Date.now()}`
        );

        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            resourceType: result.resourceType,
            duration: result.duration,
            width: result.width,
            height: result.height,
        });
    }),

    /**
     * @desc    Delete uploaded file
     * @route   DELETE /api/v1/upload/:publicId
     * @access  Private (Instructor, Admin)
     */
    deleteUpload: catchAsync(async (req: Request, res: Response) => {
        const { publicId } = req.params;
        const { resourceType } = req.query;

        if (!publicId) {
            throw new AppError("Public ID is required", STATUSCODE.BAD_REQUEST, ERROR_CODE.BAD_REQUEST);
        }

        await deleteFromCloudinary(
            decodeURIComponent(publicId),
            (resourceType as "image" | "video" | "raw") || "image"
        );

        sendResponse(res, STATUSCODE.OK, "File deleted successfully", null);
    }),
};

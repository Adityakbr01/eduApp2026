import type { Request, Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import { UploadService } from "src/services/upload-service/upload.service.js";
import { MultipartUploadService } from "src/services/upload-service/multipartUpload.js";
import { FinalizeUploadService } from "src/services/upload-service/finalizeUpload.js";
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
     * @desc    Initialize multipart upload
     * @route   POST /api/v1/upload/multipart/init
     * @access  Private
     */
    initMultipart: catchAsync(async (req: Request, res: Response) => {
        const { intentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("User not authenticated", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
        }

        if (!intentId) {
            throw new AppError("Intent ID is required", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT);
        }

        const result = await MultipartUploadService.initMultipart(userId, intentId);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Get signed URL for a specific part
     * @route   POST /api/v1/upload/multipart/sign-part
     * @access  Private
     */
    signPart: catchAsync(async (req: Request, res: Response) => {
        const { intentId, uploadId, partNumber } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("User not authenticated", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
        }

        if (!intentId || !uploadId || !partNumber) {
            throw new AppError(
                "intentId, uploadId, and partNumber are required",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        const url = await MultipartUploadService.signPart(userId, intentId, uploadId, partNumber);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, { url });
    }),

    /**
     * @desc    Complete multipart upload
     * @route   POST /api/v1/upload/multipart/complete
     * @access  Private
     */
    completeMultipart: catchAsync(async (req: Request, res: Response) => {
        const { intentId, uploadId, parts } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("User not authenticated", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
        }

        if (!intentId || !uploadId || !parts) {
            throw new AppError(
                "intentId, uploadId, and parts are required",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        const result = await MultipartUploadService.completeMultipart(userId, intentId, uploadId, parts);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result);
    }),

    /**
     * @desc    Complete upload (finalize and move to permanent storage)
     * @route   POST /api/v1/upload/complete
     * @access  Private
     */
    completeUpload: catchAsync(async (req: Request, res: Response) => {
        const { intentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("User not authenticated", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);
        }

        if (!intentId) {
            throw new AppError("Intent ID is required", STATUSCODE.BAD_REQUEST, ERROR_CODE.INVALID_INPUT);
        }

        const result = await FinalizeUploadService.finalizeUpload(userId, intentId);
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

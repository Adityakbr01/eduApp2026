import type { Request, Response } from "express";
import { UploadService } from "src/services/upload.service.js";
import { sendResponse } from "src/utils/sendResponse.js";
import { catchAsync } from "src/utils/catchAsync.js";

export const uploadController = {
  // ------------------- USER PROFILE UPLOADS -------------------
  
  /**
   * Get presigned URL for avatar upload
   * POST /upload/profile/presigned-url/avatar
   */
  getAvatarPresignedUrl: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { filename, size, type } = req.body;

    if (!filename || !size || !type) {
      return sendResponse(res, 400, "Missing required fields: filename, size, type");
    }

    const result = await UploadService.getUserAvatarPresignedUrl(
      userId,
      filename,
      size,
      type
    );

    sendResponse(res, 200, "Avatar presigned URL generated successfully", {
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
      version: result.version,
    });
  }),

  /**
   * Get presigned URL for resume upload
   * POST /upload/profile/presigned-url/resume
   */
  getResumePresignedUrl: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { filename, size, type } = req.body;

    if (!filename || !size || !type) {
      return sendResponse(res, 400, "Missing required fields: filename, size, type");
    }

    const result = await UploadService.getUserResumePresignedUrl(
      userId,
      filename,
      size,
      type
    );

    sendResponse(res, 200, "Resume presigned URL generated successfully", {
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
      version: result.version,
      filename: result.filename,
    });
  }),

  /**
   * Confirm profile upload after S3 upload completes
   * POST /upload/profile/confirm
   */
  confirmProfileUpload: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { type, key, version, filename } = req.body;

    if (!type || !key || version === undefined) {
      return sendResponse(res, 400, "Missing required fields: type, key, version");
    }

    if (!["avatar", "resume"].includes(type)) {
      return sendResponse(res, 400, "Invalid type. Must be 'avatar' or 'resume'");
    }

    const result = await UploadService.confirmProfileUpload(
      userId,
      type,
      key,
      version,
      filename
    );

    sendResponse(res, 200, `${type} upload confirmed successfully`, result);
  }),

  /**
   * Get signed URL to view resume
   * GET /upload/profile/resume/view
   */
  getResumeViewUrl: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await UploadService.getResumeViewUrl(userId);

    sendResponse(res, 200, "Resume view URL generated successfully", result);
  }),

  /**
   * Delete user resume
   * DELETE /upload/profile/resume
   */
  deleteResume: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await UploadService.deleteUserResume(userId);

    sendResponse(res, 200, "Resume deleted successfully", result);
  }),

  // ------------------- COURSE UPLOADS -------------------

  getCourseImagePresignedUrl: catchAsync(async (req: Request, res: Response) => {
    const { filename, size, type, courseId } = req.body;

    const result = await UploadService.getCourseImagePresignedUrl(
      filename,
      size,
      type,
      courseId,
    );

    sendResponse(
      res,
      200,
      "Course thumbnail presigned URL fetched successfully",
      {
        uploadUrl: result.uploadUrl,
        key: result.key,
        rawKey: result.rawKey,
        mode: "simple",
        version: result.version,
      },
    );
  }),

  getLessonVideoPresignedUrl: catchAsync(async (req: Request, res: Response) => {
    const { filename, size, mimeType, courseId, lessonId, lessonContentId } =
      req.body;

    const result = await UploadService.getLessonVideoPresignedUrl(
      filename,
      size,
      mimeType,
      courseId,
      lessonId,
      lessonContentId,
      req.user!.id,
    );

    sendResponse(res, 200, "Lesson video presigned URL fetched successfully", {
      ...result,
      rawKey: result.rawKey,
    });
  }),

  initMultipart: catchAsync(async (req: Request, res: Response) => {
    const { intentId, size } = req.body;

    const result = await UploadService.initMultipart(intentId, size);
    res.json(result);
  }),

  signPart: catchAsync(async (req: Request, res: Response) => {
    const { intentId, uploadId, partNumber } = req.body;

    const url = await UploadService.signPart(intentId, uploadId, partNumber);

    res.json({ url });
  }),

  completeMultipart: catchAsync(async (req: Request, res: Response) => {
    const { intentId, uploadId, parts } = req.body;

    const result = await UploadService.completeMultipart(
      intentId,
      uploadId,
      parts,
    );

    res.json(result);
  }),
};

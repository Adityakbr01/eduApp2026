import fs from "node:fs";
import type { Request, Response } from "express";
import { UploadService } from "src/services/upload/upload.service.js";
import { sendResponse } from "src/utils/sendResponse.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { createVdoVideo } from "src/services/liveStream/vdocipher.service.js";
import axios from "axios";
import { LessonContent } from "src/models/course/index.js";
import FormData from "form-data";
import logger from "src/utils/logger.js";


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


// simple retry helper
const retry = async (fn: any, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;
    logger.warn(`Retrying S3 upload... attempts left: ${retries}. Error: ${err.message}`, {
      status: err.response?.status,
      data: err.response?.data,
    });
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

export const uploadLessonVideo = catchAsync(
  async (req: Request, res: Response) => {
    const { lessonContentId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    logger.info("📤 Starting lesson video upload", {
      lessonContentId,
      fileName: file.originalname,
      size: file.size,
    });

    let videoId: string | null = null;

    try {
      // 1️⃣ Create video entry on VdoCipher
      const vdoData = await createVdoVideo(file.originalname);
      videoId = vdoData.videoId;

      logger.info("🎥 Vdo video created", { videoId });

      const payload = vdoData.clientPayload;

      // 2️⃣ Prepare S3 upload form
      const form = new FormData();

      // Handle ${filename} placeholder in key (required for server-side uploads)
      let uploadKey = payload.key;
      if (uploadKey.includes("${filename}")) {
        // Optional: sanitize filename for safety (remove/replace unsafe chars)
        const safeFilename = file.originalname.replace(/[^\w.-]/gi, "_");
        uploadKey = uploadKey.replace("${filename}", safeFilename);
      }
      form.append("key", uploadKey);

      form.append("policy", payload.policy);
      form.append("x-amz-algorithm", payload["x-amz-algorithm"]);
      form.append("x-amz-credential", payload["x-amz-credential"]);
      form.append("x-amz-date", payload["x-amz-date"]);
      form.append("x-amz-signature", payload["x-amz-signature"]);

      // REQUIRED by VdoCipher policy
      form.append("success_action_status", "201");

      // Optional but matches official examples (empty redirect)
      form.append("success_action_redirect", "");

      // REMOVED: Content-Type append (can cause 403 if not expected in policy)
      // If you encounter issues with certain file types, test re-adding it conditionally

      // File must always be LAST
      form.append("file", fs.createReadStream(file.path));

      // Calculate total length for S3 (Prevent Chunked Encoding - CRITICAL)
      const contentLength = await new Promise<number>((resolve, reject) => {
        form.getLength((err, length) => {
          if (err) reject(err);
          else resolve(length);
        });
      });

      // Prepare headers with explicit Content-Length
      const headers = {
        ...form.getHeaders(),
        "Content-Length": contentLength,
      };

      // 3️⃣ Upload to S3 with retry
      await retry(async () => {
        const response = await axios.post(payload.uploadLink, form, {
          headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 1200000, // 20 minutes - adjust for very large files if needed
          validateStatus: (status) => status === 201, // S3 must return 201
        });

        return response;
      }, 3); // Increased to 3 retries (4 total attempts) for reliability

      logger.info("☁️ File uploaded to S3 successfully", { videoId });

      // 4️⃣ Update DB
      const updated = await LessonContent.findByIdAndUpdate(
        lessonContentId,
        {
          video: {
            provider: "vdocipher",
            vdoId: videoId,
            status: "UPLOADED",
          },
        },
        { new: true }
      );

      if (!updated) {
        throw new Error("LessonContent not found");
      }

      logger.info("🗄 DB updated with video info", { lessonContentId });

      sendResponse(res, 200, "Upload started successfully", {
        videoId,
      });
    } catch (error: any) {
      logger.error("❌ Vdo Upload Error", {
        message: error.message,
        response: error.response?.data,
        videoId,
      });

      if (videoId) {
        await LessonContent.findByIdAndUpdate(lessonContentId, {
          "video.status": "FAILED",
        }).catch(() => { });
      }

      sendResponse(res, 500, "Upload failed", {
        error: "Upload failed",
        details: error.response?.data || error.message,
      });
    } finally {
      // 5️⃣ Cleanup local temp file
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) {
            logger.error("Failed to delete temp file", { error: err });
          } else {
            logger.info("🧹 Temp file deleted");
          }
        });
      }
    }
  }
);

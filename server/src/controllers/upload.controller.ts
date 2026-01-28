import type { Request, Response } from "express";
import { UploadService } from "src/services/upload.service.js";
import { sendResponse } from "src/utils/sendResponse.js";

export const uploadController = {
  getCourseImagePresignedUrl: async (req: Request, res: Response) => {
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
        mode: "simple",
        version: result.version,
      },
    );
  },

  getLessonVideoPresignedUrl: async (req: Request, res: Response) => {
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
  },

  initMultipart: async (req: Request, res: Response) => {
    const { intentId, size } = req.body;

    const result = await UploadService.initMultipart(intentId, size);
    res.json(result);
  },

  signPart: async (req: Request, res: Response) => {
    const { intentId, uploadId, partNumber } = req.body;

    const url = await UploadService.signPart(intentId, uploadId, partNumber);

    res.json({ url });
  },
  completeMultipart: async (req: Request, res: Response) => {
    const { intentId, uploadId, parts } = req.body;

    const result = await UploadService.completeMultipart(
      intentId,
      uploadId,
      parts,
    );

    res.json(result);
  },
};

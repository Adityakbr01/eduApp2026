import type { Request, Response } from "express";
import { UploadService } from "src/services/upload.service.js";
import { sendResponse } from "src/utils/sendResponse.js";

export const uploadController = {
    getPresignedUrl: async (req: Request, res: Response) => {
        const {
            filename,
            size,
            type,
            key,
        } = req.body;
        const result = await UploadService.getPresignedUrl(
            filename,
            size,
            type,
            key
        );
        sendResponse(res, 200, "Presigned URL fetched successfully", { ...result, key: result.intentId });
    },

    initMultipart: async (req: Request, res: Response) => {
        const { intentId, size } = req.body;

        const result = await UploadService.initMultipart(intentId, size);
        res.json(result);
    },

    signPart: async (req: Request, res: Response) => {
        const { intentId, uploadId, partNumber } = req.body;

        const url = await UploadService.signPart(
            intentId,
            uploadId,
            partNumber
        );

        res.json({ url });
    },
    completeMultipart: async (req: Request, res: Response) => {
        const { intentId, uploadId, parts } = req.body;

        const result = await UploadService.completeMultipart(
            intentId,
            uploadId,
            parts
        );

        res.json(result);
    }
}
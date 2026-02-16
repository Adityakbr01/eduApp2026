import type { Request, Response } from "express";
import mongoose from "mongoose";
import LessonContent from "src/models/course/lessonContent.model.js";
import { catchAsync } from "src/utils/catchAsync.js";
import logger from "src/utils/logger.js";
import { sendResponse } from "src/utils/sendResponse.js";

export const vdoWebhookHandler = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const { event, payload } = req.body;

            const videoId = payload?.id;
            const durationSeconds = payload?.length;
            const failureReason = payload?.error || null;

            logger.info("📥 VdoCipher Webhook Received", {
                event,
                videoId,
            });

            if (!videoId) {
                logger.error("❌ Missing videoId in webhook payload", {
                    body: req.body,
                });

                return sendResponse(res, 400, "Missing videoId", false);
            }

            // Always use atomic $set update (STREAM SAFE)
            const updatePayload: Record<string, any> = {};

            if (event === "video:ready") {
                updatePayload["video.status"] = "READY";
                updatePayload["video.duration"] =
                    durationSeconds !== undefined ? Math.round(durationSeconds) : undefined;
                updatePayload["video.failureReason"] = null;
                updatePayload["video.isEmailSent"] = false;
                updatePayload["video.version"] = 1; // optional version bump
                updatePayload["video.thumbnails"] = payload?.thumbnails || [];
            }

            if (event === "video:failed") {
                updatePayload["video.status"] = "FAILED";
                updatePayload["video.failureReason"] = failureReason || "Unknown error";
            }

            if (Object.keys(updatePayload).length === 0) {
                logger.warn("⚠️ Unknown event received", { event });
                return sendResponse(res, 200, "Event ignored", true);
            }

            // Remove undefined fields (important)
            Object.keys(updatePayload).forEach((key) => {
                if (updatePayload[key] === undefined) {
                    delete updatePayload[key];
                }
            });

            const result = await LessonContent.updateOne(
                { "video.videoId": videoId },
                {
                    $set: updatePayload,
                }
            );

            if (result.matchedCount === 0) {
                logger.warn("⚠️ LessonContent not found for videoId", {
                    videoId,
                });
                return sendResponse(res, 200, "Video not mapped", true);
            }

            logger.info("✅ Video status updated from webhook", {
                videoId,
                event,
                modifiedCount: result.modifiedCount,
            });

            return sendResponse(res, 200, "Webhook processed", true);
        } catch (error: any) {
            logger.error("❌ Webhook processing error", {
                message: error.message,
                stack: error.stack,
            });
            // Return 200 to prevent VdoCipher from retrying indefinitely on internal errors if manually handled
            // However, typically 500 should be returned for temporary server issues.
            // But if the error is unrecoverable (e.g. bad data), 200 is safer.
            // For now, let's return 500 to indicate failure properly.
            return sendResponse(res, 500, "Webhook processing failed", false);
        }
    }
);

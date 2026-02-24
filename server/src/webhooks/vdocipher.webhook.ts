import type { Request, Response } from "express";
import mongoose from "mongoose";
import LessonContent from "src/models/course/lessonContent.model.js";
import LiveStream from "src/models/course/liveStream.model.js";
import liveStreamQueue from "src/bull/queues/liveStream.queue.js";
import { JOB_NAMES } from "src/bull/config/bullmq.config.js";
import { clearViewerCount } from "src/utils/liveViewerCounter.js";
import { catchAsync } from "src/utils/catchAsync.js";
import logger from "src/utils/logger.js";
import { sendResponse } from "src/utils/sendResponse.js";

/**
 * Handles VdoCipher VOD (Video on Demand) Webhook Events
 * Events: video:ready, video:failed
 */
const handleVODEvent = async (event: string, payload: any, res: Response) => {
    const videoId = payload?.id;
    const durationSeconds = payload?.length;
    const failureReason = payload?.error || null;

    if (!videoId) {
        logger.error("❌ Missing videoId in webhook payload", { payload });
        return sendResponse(res, 400, "Missing videoId", false);
    }

    const updatePayload: Record<string, any> = {};

    if (event === "video:ready") {
        updatePayload["video.status"] = "READY";
        updatePayload["video.duration"] = durationSeconds !== undefined ? Math.round(durationSeconds) : undefined;
        updatePayload["video.failureReason"] = null;
        updatePayload["video.version"] = 1;
        updatePayload["video.thumbnails"] = payload?.thumbnails || [];
    }

    if (event === "video:failed") {
        updatePayload["video.status"] = "FAILED";
        updatePayload["video.failureReason"] = failureReason || "Unknown error";
    }

    // Remove undefined fields
    Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === undefined) {
            delete updatePayload[key];
        }
    });

    const result = await LessonContent.updateOne(
        { "video.videoId": videoId },
        { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
        logger.warn("⚠️ LessonContent not found for videoId", { videoId });
        return sendResponse(res, 200, "Video not mapped", true);
    }

    logger.info("✅ VOD status updated from webhook", {
        videoId,
        event,
        modifiedCount: result.modifiedCount,
    });

    return sendResponse(res, 200, "Webhook processed", true);
};

/**
 * Handles VdoCipher Live Stream Webhook Events
 * Events: live.started, live.ended, live.recording.ready
 */
const handleLiveEvent = async (event: string, payload: any, res: Response) => {
    const liveId = payload?.id || payload?.liveId;

    if (!liveId) {
        logger.error("❌ Missing liveId in live webhook payload", { payload });
        return sendResponse(res, 400, "Missing liveId");
    }

    const liveStream = await LiveStream.findOne({ liveId });

    if (!liveStream) {
        logger.warn("⚠️ LiveStream not found for liveId", { liveId });
        return sendResponse(res, 200, "LiveStream not mapped");
    }

    // Idempotency check 
    const eventKey = `${event}:${liveId}`;
    if (liveStream.webhookProcessedEvents.includes(eventKey)) {
        logger.warn("⚠️ Duplicate webhook event, skipping", { eventKey });
        return sendResponse(res, 200, "Event already processed");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        switch (event) {
            case "live.started": {
                liveStream.status = "live";
                liveStream.webhookProcessedEvents.push(eventKey);
                await liveStream.save({ session });
                logger.info("🔴 Live stream STARTED", { liveId });
                break;
            }

            case "live.ended": {
                liveStream.status = "ended";
                liveStream.webhookProcessedEvents.push(eventKey);
                await liveStream.save({ session });

                // Clear Redis viewer count
                await clearViewerCount(liveId);
                logger.info("⏹️ Live stream ENDED", { liveId });
                break;
            }

            case "live.recording.ready": {
                const recordedVideoId = payload?.recordedVideoId || payload?.videoId;

                if (!recordedVideoId) {
                    logger.error("❌ Missing recordedVideoId in recording.ready payload", { payload });
                    await session.abortTransaction();
                    return sendResponse(res, 200, "Missing recordedVideoId");
                }

                // Mark the event as processed to prevent infinite loops (Idempotency)
                liveStream.webhookProcessedEvents.push(eventKey);
                await liveStream.save({ session });

                // End the transaction EARLY since createRecordingLessonContent operates on its own session/transaction
                await session.commitTransaction();

                try {
                    // Update database synchronously FIRST
                    const { liveStreamService } = await import("src/services/liveStream/liveStream.service.js");
                    await liveStreamService.createRecordingLessonContent(liveId, recordedVideoId);

                    // Then dispatch BullMQ job for background fallback tasks e.g Emails
                    // We re-fetch to see the updated boolean states (like recordingProcessed)
                    const liveStreamDoc = await LiveStream.findOne({ liveId });

                    if (liveStreamDoc?.autoSaveRecording) {
                        await liveStreamQueue.add(
                            JOB_NAMES.LIVE_STREAM.CREATE_RECORDING_CONTENT,
                            { liveId, recordedVideoId }
                        );
                        logger.info("📦 Background job dispatched to BullMQ", { liveId, recordedVideoId });
                    }

                    // Log completion
                    logger.info("📼 Live recording READY & Processed Synced", { liveId, recordedVideoId });
                    return sendResponse(res, 200, "Webhook processed successfully");

                } catch (err: any) {
                    logger.error("❌ Error running direct recording assignment", err);
                    return sendResponse(res, 500, "Webhook processing failed during recording assignment");
                }
            }

            default: {
                logger.warn("⚠️ Unknown live webhook event inside handler", { event });
                await session.abortTransaction();
                return sendResponse(res, 200, "Event ignored");
            }
        }

        // Only commit if the transaction is still active
        if (session.inTransaction()) {
            await session.commitTransaction();
        }
        return sendResponse(res, 200, "Webhook processed successfully");
    } catch (error: any) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        logger.error("❌ Live webhook processing error", {
            event,
            liveId,
            message: error.message,
            stack: error.stack,
        });
        return sendResponse(res, 500, "Webhook processing failed");
    } finally {
        session.endSession();
    }
};

/**
 * Main Combined VdoCipher Webhook Handler
 * POST /api/v1/webhooks/vdocipher
 */
export const vdoWebhookHandler = catchAsync(async (req: Request, res: Response) => {
    try {
        const { event, payload } = req.body;

        logger.info("📥 VdoCipher Webhook Received", { event, id: payload?.id });

        if (!event) {
            return sendResponse(res, 400, "Missing event type", false);
        }

        // VdoCipher sends VOD events as "video:ready", "video:failed"
        if (event.startsWith("video:")) {
            return await handleVODEvent(event, payload, res);
        }

        // VdoCipher sends Live events as "live.started", "live.ended", etc.
        if (event.startsWith("live.")) {
            return await handleLiveEvent(event, payload, res);
        }

        logger.warn("⚠️ Unknown event category received", { event });
        return sendResponse(res, 200, "Event ignored", true);

    } catch (error: any) {
        logger.error("❌ Global Webhook processing error", {
            message: error.message,
            stack: error.stack,
        });
        return sendResponse(res, 500, "Webhook processing failed", false);
    }
});

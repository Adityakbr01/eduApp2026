import crypto from "crypto";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "src/configs/env.js";
import LiveStream from "src/models/course/liveStream.model.js";
import liveStreamQueue from "src/bull/queues/liveStream.queue.js";
import { JOB_NAMES } from "src/bull/config/bullmq.config.js";
import { clearViewerCount } from "src/utils/liveViewerCounter.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import logger from "src/utils/logger.js";

/**
 * Verify VdoCipher webhook signature
 */
const verifyWebhookSignature = (
    payload: string,
    signature: string | undefined
): boolean => {
    if (!signature) return false;

    const expectedSignature = crypto
        .createHmac("sha256", env.VDO_WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

/**
 * POST /api/v1/webhooks/vdocipher/live
 * Handles VdoCipher Live webhook events
 *
 * Events:
 * - live.started → status = live
 * - live.ended → status = ended, clear viewer count
 * - live.recording.ready → dispatch BullMQ job for LessonContent creation
 */
export const liveStreamWebhookHandler = catchAsync(
    async (req: Request, res: Response) => {
        const rawBody = JSON.stringify(req.body);
        const signature = req.headers["x-vdocipher-signature"] as string | undefined;

        // 1. Verify webhook signature
        if (!verifyWebhookSignature(rawBody, signature)) {
            logger.warn("⚠️ Invalid webhook signature for live stream event", {
                ip: req.ip,
            });
            return sendResponse(res, 401, "Invalid webhook signature");
        }

        const { event, payload } = req.body;
        const liveId = payload?.id || payload?.liveId;

        logger.info("📥 VdoCipher Live Webhook Received", { event, liveId });

        if (!liveId) {
            logger.error("❌ Missing liveId in live webhook payload", {
                body: req.body,
            });
            return sendResponse(res, 400, "Missing liveId");
        }

        // 2. Find live stream
        const liveStream = await LiveStream.findOne({ liveId });

        if (!liveStream) {
            logger.warn("⚠️ LiveStream not found for liveId", { liveId });
            // Return 200 to prevent VdoCipher from retrying
            return sendResponse(res, 200, "LiveStream not mapped");
        }

        // 3. Idempotency check — has this event already been processed?
        const eventKey = `${event}:${liveId}`;
        if (liveStream.webhookProcessedEvents.includes(eventKey)) {
            logger.warn("⚠️ Duplicate webhook event, skipping", { eventKey });
            return sendResponse(res, 200, "Event already processed");
        }

        // 4. Handle events with transaction
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
                    const recordedVideoId =
                        payload?.recordedVideoId || payload?.videoId;

                    if (!recordedVideoId) {
                        logger.error(
                            "❌ Missing recordedVideoId in recording.ready payload",
                            { payload }
                        );
                        await session.abortTransaction();
                        return sendResponse(res, 200, "Missing recordedVideoId");
                    }

                    // Store recordedVideoId on the stream
                    liveStream.recordedVideoId = recordedVideoId;
                    liveStream.webhookProcessedEvents.push(eventKey);
                    await liveStream.save({ session });

                    // Dispatch BullMQ job for LessonContent creation
                    // (only if autoSaveRecording is true)
                    if (liveStream.autoSaveRecording) {
                        await liveStreamQueue.add(
                            JOB_NAMES.LIVE_STREAM.CREATE_RECORDING_CONTENT,
                            {
                                liveId,
                                recordedVideoId,
                            }
                        );

                        logger.info("📦 Recording job dispatched to BullMQ", {
                            liveId,
                            recordedVideoId,
                        });
                    }

                    logger.info("📼 Live recording READY", {
                        liveId,
                        recordedVideoId,
                    });
                    break;
                }

                default: {
                    logger.warn("⚠️ Unknown live webhook event", { event });
                    await session.abortTransaction();
                    return sendResponse(res, 200, "Event ignored");
                }
            }

            await session.commitTransaction();
            return sendResponse(res, 200, "Webhook processed successfully");
        } catch (error: any) {
            await session.abortTransaction();
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
    }
);

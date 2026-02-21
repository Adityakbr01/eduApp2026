import { QUEUE_NAMES } from "src/bull/config/bullmq.config.js";
import pushNotificationQueue from "src/bull/queues/pushNotification.queue.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import UserPreferenceModel from "src/models/user/userPreference.model.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";

interface DeviceRegistrationParams {
    userId: string;
    token: string;
    platform: "web" | "android" | "ios" | "unknown";
}

interface PushNotificationParams {
    userId?: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

interface SendToAllPushNotificationParams {
    title: string;
    body: string;
    targetPlatforms?: string[]; // "web", "android", "ios"
    data?: Record<string, string>;
}

interface SchedulePushParams extends PushNotificationParams {
    delayMs?: number; // One-time scheduled
    cron?: string;    // Recurring
    isSendToAll?: boolean;
    targetPlatforms?: string[];
}

class PushNotificationService {
    /**
     * Register a new device token for a user.
     * Appends to or updates the user's FCM tokens array.
     */
    async registerDevice({ userId, token, platform }: DeviceRegistrationParams) {
        if (!token) {
            throw new AppError("Token is required", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        try {
            const userPref = await UserPreferenceModel.findOne({ userId });

            if (!userPref) {
                // Should exist from auth registration, but fallback just in case
                await UserPreferenceModel.create({
                    userId,
                    fcmTokens: [{ token, platform, notificationsEnabled: true }],
                });
                return;
            }

            const tokenExists = userPref.fcmTokens.some((t) => t.token === token);

            if (!tokenExists) {
                await UserPreferenceModel.updateOne(
                    { userId },
                    {
                        $push: {
                            fcmTokens: {
                                token,
                                platform,
                                notificationsEnabled: true
                            }
                        }
                    }
                );
                logger.info(`✅ Device token registered for user ${userId}`);
            }
        } catch (error) {
            logger.error(`Failed to register device token for user ${userId}:`, error);
            throw new AppError("Failed to register device");
        }
    }

    /**
     * Send an immediate push notification via BullMQ.
     */
    async sendPushNotification({ userId, title, body, data }: PushNotificationParams) {
        if (!userId || !title || !body) {
            throw new AppError("User ID, Title, and Body are required", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        try {
            await pushNotificationQueue.add(QUEUE_NAMES.PUSH_NOTIFICATION, {
                userId,
                title,
                body,
                data,
            });
            logger.info(`✅ Instant notification queued for user ${userId}`);
        } catch (error) {
            logger.error(`Failed to enqueue notification for user ${userId}:`, error);
            throw new AppError("Failed to send push notification");
        }
    }

    /**
     * Send an immediate push notification to ALL users via BullMQ.
     * Optionally filter by target platforms (e.g., ["web", "android"]).
     */
    async sendToAllPushNotification({ title, body, targetPlatforms, data }: SendToAllPushNotificationParams) {
        if (!title || !body) {
            throw new AppError("Title and Body are required", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        try {
            await pushNotificationQueue.add(QUEUE_NAMES.PUSH_NOTIFICATION, {
                title,
                body,
                data,
                isSendToAll: true,
                targetPlatforms,
            });
            logger.info(`✅ Instant Send-to-All notification queued (Platforms: ${targetPlatforms ? targetPlatforms.join(', ') : 'All'})`);
        } catch (error) {
            logger.error(`Failed to enqueue send-to-all notification:`, error);
            throw new AppError("Failed to send push notification to all users");
        }
    }

    /**
     * Schedule a delayed or recurring notification via BullMQ.
     */
    async schedulePushNotification({ userId, title, body, data, delayMs, cron, isSendToAll, targetPlatforms }: SchedulePushParams) {
        if (!isSendToAll && !userId) {
            throw new AppError("User ID is required for targeted notifications", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }
        if (!title || !body) {
            throw new AppError("Title and Body are required", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        try {
            const jobOptions: any = {};

            if (delayMs && delayMs > 0) {
                jobOptions.delay = delayMs;
            }
            if (cron) {
                jobOptions.repeat = { pattern: cron };
            }

            await pushNotificationQueue.add(QUEUE_NAMES.PUSH_NOTIFICATION, {
                userId,
                title,
                body,
                data,
                isSendToAll,
                targetPlatforms,
            }, jobOptions);

            logger.info(`✅ Scheduled notification queued ${isSendToAll ? '(All Users)' : `for user ${userId}`}`);
        } catch (error) {
            logger.error(`Failed to enqueue scheduled notification:`, error);
            throw new AppError("Failed to schedule push notification");
        }
    }

    /**
     * Enable/Disable push notifications for a specific token
     */
    async toggleNotifications(userId: string, token: string, enabled: boolean) {
        await UserPreferenceModel.updateOne(
            { userId, "fcmTokens.token": token },
            { $set: { "fcmTokens.$.notificationsEnabled": enabled } }
        );
    }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

import { Worker, Job } from "bullmq";
import { bullMQConnection } from "src/configs/redis.js";
import UserPreferenceModel from "src/models/user/userPreference.model.js";
import { getFcmMessaging } from "src/configs/firebase.js";
import logger from "src/utils/logger.js";
import { QUEUE_NAMES } from "../config/bullmq.config.js";
import { env } from "src/configs/env.js";

export interface PushNotificationJobPayload {
    userId?: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    isSendToAll?: boolean;
    targetPlatforms?: string[];
}

const BATCH_SIZE = 500;

export const pushNotificationWorker = new Worker(
    QUEUE_NAMES.PUSH_NOTIFICATION,
    async (job: Job<PushNotificationJobPayload>) => {
        const startTime = Date.now();
        logger.info(`Processing push job ${job.id}`);

        try {
            const { userId, title, body, data, isSendToAll, targetPlatforms } =
                job.data;

            const messaging = getFcmMessaging();
            const tokenToUserMap = new Map<string, string>();
            const tokens: string[] = [];

            if (isSendToAll) {
                const cursor = UserPreferenceModel.find({
                    fcmTokens: { $exists: true, $not: { $size: 0 } },
                }).cursor();

                for await (const pref of cursor) {
                    for (const tokenObj of pref.fcmTokens) {
                        if (
                            tokenObj.notificationsEnabled &&
                            (!targetPlatforms ||
                                targetPlatforms.length === 0 ||
                                targetPlatforms.includes(tokenObj.platform))
                        ) {
                            if (!tokenToUserMap.has(tokenObj.token)) {
                                tokens.push(tokenObj.token);
                                tokenToUserMap.set(tokenObj.token, pref.userId.toString());
                            }
                        }
                    }
                }
            } else {
                if (!userId) return;

                const pref = await UserPreferenceModel.findOne({ userId });
                if (pref?.fcmTokens?.length) {
                    for (const tokenObj of pref.fcmTokens) {
                        if (tokenObj.notificationsEnabled) {
                            tokens.push(tokenObj.token);
                            tokenToUserMap.set(tokenObj.token, userId);
                        }
                    }
                }
            }

            if (!tokens.length) {
                logger.warn("No tokens found.");
                return;
            }

            let successCount = 0;
            let failureCount = 0;
            const invalidTokens: string[] = [];

            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batch = tokens.slice(i, i + BATCH_SIZE);

                const response = await messaging.sendEachForMulticast({
                    tokens: batch,
                    notification: { title, body },
                    data: data || {},
                });

                successCount += response.successCount;
                failureCount += response.failureCount;

                response.responses.forEach((resp, index) => {
                    if (!resp.success) {
                        const code = resp.error?.code;
                        if (
                            code === "messaging/invalid-registration-token" ||
                            code === "messaging/registration-token-not-registered"
                        ) {
                            invalidTokens.push(batch[index]);
                        }
                    }
                });
            }

            if (invalidTokens.length) {
                const bulkOps = invalidTokens.map((token) => {
                    const mappedUser = tokenToUserMap.get(token);
                    if (!mappedUser) return null;

                    return {
                        updateOne: {
                            filter: { userId: mappedUser },
                            update: { $pull: { fcmTokens: { token } } },
                        },
                    };
                }).filter(Boolean);

                if (bulkOps.length) {
                    await UserPreferenceModel.bulkWrite(bulkOps as any[]);
                }
            }

            logger.info(
                `Push completed | Success=${successCount} | Failed=${failureCount} | Duration=${Date.now() - startTime
                }ms`
            );
        } catch (error) {
            logger.error("Push worker failed", error);
            throw error;
        }
    },
    {
        connection: bullMQConnection,
        concurrency: env.BULLMQ_WORKER_CONCURRENCY || 5,
    }
);
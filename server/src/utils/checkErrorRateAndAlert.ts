
import logger from "../utils/logger.js";


/**
 * Checks error rate in a batch and sends email alert if > 90%
 */
const checkErrorRateAndAlert = async (metrics: any[], redis: any) => {
    try {
        let totalReqs = 0;
        let errorReqs = 0;

        metrics.forEach((m: any) => {
            totalReqs++;
            if (m.statusCode >= 500) errorReqs++; // 5xx errors
        });

        // Skip if volume is too low to be statistically significant
        if (totalReqs < 10) return;

        const batchErrorRate = (errorReqs / totalReqs) * 100;

        //Not tested yet
        if (batchErrorRate > 90) {
            const alertKey = "alert:high_error_rate";
            const isCoolingDown = await redis.get(alertKey);

            if (!isCoolingDown) {
                // Lazy load these to prevent initialization issues
                const emailQueue = (await import("../bull/queues/email.queue.js")).default;
                const { EMAIL_TYPES } = await import("../constants/email-types.constants.js");
                const { env } = await import("../configs/env.js");

                if (!env.ADMIN_EMAIL) {
                    logger.warn("⚠️ High error rate detected but ADMIN_EMAIL is not set. Skipping alert.");
                    return;
                }

                logger.warn(`🚨 High Error Rate Detected: ${batchErrorRate.toFixed(1)}%. Sending Alert to ${env.ADMIN_EMAIL}...`);

                await emailQueue.add("send-email", {
                    type: EMAIL_TYPES.HIGH_ERROR_RATE_ALERT,
                    payload: {
                        email: env.ADMIN_EMAIL,
                        errorRate: batchErrorRate,
                        total: totalReqs,
                        batchSize: metrics.length
                    }
                });

                // Set cooldown for 15 minutes
                await redis.set(alertKey, "1", "EX", 900);
            }
        }
    } catch (error) {
        logger.error("⚠️ Failed to process error rate alert:", error);
    }
};


export default checkErrorRateAndAlert;
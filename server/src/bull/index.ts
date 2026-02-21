import logger from "src/utils/logger.js";
import { emailWorker } from "./workers/email.worker.js";
import { progressWorker } from "./workers/progress.worker.js";
import { notificationWorker } from "./workers/notification.worker.js";
import { pushNotificationWorker } from "./workers/pushNotification.worker.js";

const ALL_WORKERS = [emailWorker, progressWorker, notificationWorker, pushNotificationWorker];

export function startWorkers() {
    logger.info("⚙️ Starting BullMQ workers...");
    ALL_WORKERS.forEach((worker) => {
        logger.info(`  ✅ ${worker.name} worker registered`);
    });
    logger.info("✅ Workers started");
}

export async function stopWorkers() {
    logger.info("⏳ Stopping workers...");

    try {
        for (const worker of ALL_WORKERS) {
            if (worker?.close) {
                await worker.close();
            }
        }
        logger.info("✅ Workers stopped");
    } catch (err) {
        logger.error("❌ Error stopping workers", err);
    }
}

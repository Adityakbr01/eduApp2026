import logger from "src/utils/logger.js";
import { emailWorker } from "./workers/email.worker.js";

const ALL_WORKERS = [emailWorker];

export function startWorkers() {
    logger.info("⚙️ Starting BullMQ workers...");
    ALL_WORKERS.forEach(() => { });
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


import { initVideoStatusStream } from "./videoStatus.stream.js";
import logger from "src/utils/logger.js";

export function initStreams() {
    logger.info("📡 Initializing Streams...");
    initVideoStatusStream();
    logger.info("✅ Streams Initialized");
}

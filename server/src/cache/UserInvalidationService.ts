import sessionService from "src/services/session.service.js";
import { cacheInvalidation } from "./cacheInvalidation.js";
import logger from "src/utils/logger.js";

class UserInvalidationService {
    /**
     * Completely invalidate all session & permissions for a user
     */
    async invalidateUserEverything(userId: string): Promise<void> {
        try {
            // 1️⃣ Delete session from Redis
            await sessionService.deleteSession(userId);

            // 2️⃣ Clear session permissions
            await sessionService.clearSessionPermissions(userId);

            // 3️⃣ Clear user-related caches
            await cacheInvalidation.invalidateUser(userId);

            logger.info(`✅ User fully invalidated | userId=${userId}`);
        } catch (err) {
            logger.warn(`⚠️ Failed to fully invalidate user | userId=${userId}`, err);
        }
    }
}

export default new UserInvalidationService();

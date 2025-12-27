import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import sessionService from "src/services/session.service.js";

async function invalidateUserAuth(userId: string) {
    await cacheManager.del(cacheKeyFactory.user.byId(userId));
    await sessionService.deleteSession(userId);
}

export default invalidateUserAuth;
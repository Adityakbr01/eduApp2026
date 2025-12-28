import cacheManager from "src/cache/cacheManager.js";
import { env } from "src/configs/env.js";
import logger from "src/utils/logger.js";

/**
 * Session Service
 * - Enforces SINGLE DEVICE login
 * - Redis stores only sessionId (source of truth)
 */

export interface SessionData {
    sessionId: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
}

class SessionService {
    /**
     * Redis key for user session
     */
    private getSessionKey(userId: string): string {
        return `session:user:${userId}`;
    }

    /**
     * Create / overwrite session
     * → Any previous session is INVALIDATED automatically
     */
    async createSession(
        userId: string,
        sessionId: string,
    ): Promise<void> {
        const sessionKey = this.getSessionKey(userId);
        const ttl = env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS;
        const now = Date.now();

        const sessionData: SessionData = {
            sessionId,
            userId,
            createdAt: now,
            expiresAt: now + ttl * 1000,
        };

        await cacheManager.set(sessionKey, sessionData, ttl);

        logger.info(
            `✅ Session created | user=${userId} | sessionId=${sessionId}`
        );
    }


    /**
     * Validate session using sessionId
     * → Used by access token middleware & refresh token
     */
    async validateSession(userId: string, sessionId: string): Promise<boolean> {
        const sessionKey = this.getSessionKey(userId);
        const session = (await cacheManager.get(sessionKey)) as SessionData | null;

        if (!session) {
            logger.info(`❌ No active session for user=${userId}`);
            return false;
        }

        if (session.expiresAt < Date.now()) {
            logger.info(`❌ Session expired for user=${userId}`);
            await this.deleteSession(userId);
            return false;
        }

        const isValid = session.sessionId === sessionId;

        if (!isValid) {
            logger.info(
                `❌ Session mismatch | user=${userId} | force logout`
            );
        }

        return isValid;
    }

    /**
     * Get active session (debug / admin use)
     */
    async getSession(userId: string): Promise<SessionData | null> {
        const sessionKey = this.getSessionKey(userId);
        return (await cacheManager.get(sessionKey)) as SessionData | null;
    }

    /**
     * Delete session (logout / password change / security)
     */
    async deleteSession(userId: string): Promise<void> {
        const sessionKey = this.getSessionKey(userId);
        await cacheManager.del(sessionKey);
        logger.info(`🗑️ Session deleted | user=${userId}`);
    }

    /**
     * Check if user has valid active session
     */
    async hasActiveSession(userId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        if (!session) return false;
        return session.expiresAt > Date.now();
    }

    // Get permissions from active session
    // async getSessionPermissions(userId: string): Promise<string[]> {
    //     const session = await this.getSession(userId);
    //     return session?.permissions || [];
    // }

}

export default new SessionService();

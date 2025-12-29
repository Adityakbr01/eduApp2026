import cacheInvalidation from "src/cache/cacheInvalidation.js";
import cacheManager from "src/cache/cacheManager.js";
import { env } from "src/configs/env.js";
import type { PermissionDTO } from "src/types/auth.type.js";
import logger from "src/utils/logger.js";

export interface SessionData {
    sessionId: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
    permissions?: PermissionDTO[];
}

class SessionService {
    private getSessionKey(userId: string): string {
        return `session:user:${userId}`;
    }

    private async saveSession(userId: string, session: SessionData): Promise<void> {
        const ttl = Math.floor((session.expiresAt - Date.now()) / 1000);
        await cacheManager.set(this.getSessionKey(userId), session, ttl);
    }

    async createSession(userId: string, sessionId: string): Promise<void> {
        const now = Date.now();
        const session: SessionData = {
            sessionId,
            userId,
            createdAt: now,
            expiresAt: now + env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
        };
        await this.saveSession(userId, session);
        logger.info(`✅ Session created | user=${userId} | sessionId=${sessionId}`);
    }

    async validateSession(userId: string, sessionId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        if (!session || session.expiresAt < Date.now() || session.sessionId !== sessionId) {
            if (session?.expiresAt < Date.now()) await this.deleteSession(userId);
            logger.info(`❌ Session invalid for user=${userId}`);
            return false;
        }
        return true;
    }

    async getSession(userId: string): Promise<SessionData | null> {
        return (await cacheManager.get(this.getSessionKey(userId))) as SessionData | null;
    }

    async deleteSession(userId: string): Promise<void> {
        await cacheManager.del(this.getSessionKey(userId));
        logger.info(`🗑️ Session deleted | user=${userId}`);
    }

    async hasActiveSession(userId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        return !!session && session.expiresAt > Date.now();
    }

    // Permissions helpers
    private async updateSessionPermissions(userId: string, permissions?: PermissionDTO[]): Promise<void> {
        const session = await this.getSession(userId);
        if (!session) return;

        const updatedSession: SessionData = { ...session, permissions };
        await this.saveSession(userId, updatedSession);
        logger.info(permissions ? `✅ Session permissions updated | user=${userId}` : `✅ Session permissions cleared | user=${userId}`);
    }

    async setSessionPermissions(userId: string, permissions: PermissionDTO[]): Promise<void> {
        await this.updateSessionPermissions(userId, permissions);
    }

    async getSessionPermissions(userId: string): Promise<PermissionDTO[]> {
        const session = await this.getSession(userId);
        return session?.permissions || [];
    }

    async clearSessionPermissions(userId: string): Promise<void> {
        await this.updateSessionPermissions(userId, undefined);
        await cacheInvalidation.invalidateUserSession(userId);
    }
}

export default new SessionService();

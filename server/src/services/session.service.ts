import cacheManager from "src/cache/cacheManager.js";
import { env } from "src/configs/env.js";

export interface SessionData {
    sessionId: string;
    userId: string;
    roleId?: string;
    roleName?: string;
    createdAt: number;
    expiresAt: number;
}

class SessionService {
    // 🔑 single session per user
    private getSessionKey(userId: string): string {
        const key = `session:user:${userId}`;
        return key;
    }
    // 🔹 save / overwrite session
    private async saveSession(session: SessionData): Promise<void> {
        const ttl = Math.floor(
            (session.expiresAt - Date.now()) / 1000
        );

        if (ttl <= 0) {
            console.error("❌ Invalid session TTL", {
                expiresAt: session.expiresAt,
                now: Date.now(),
            });
            return;
        }


        const result = await cacheManager.set(
            this.getSessionKey(session.userId),
            session,
        );

    }

    // 🔹 create session (old one auto replaced)
    async createSession(
        userId: string,
        sessionId: string,
        roleId: string,
        roleName: string
    ): Promise<void> {
        const now = Date.now();

        const session: SessionData = {
            sessionId: String(sessionId),
            userId: String(userId),      // 🔹 already done
            roleId: String(roleId),
            roleName,
            createdAt: now,
            expiresAt: now + env.JWT_REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
        };
        await this.saveSession(session);
    }


    // 🔹 get active session
    async getSession(userId: string): Promise<SessionData | null> {
        return (await cacheManager.get(
            this.getSessionKey(userId)
        )) as SessionData | null;
    }

    // 🔹 validate session (JWT guard)
    async validateSession(
        userId: string,
        sessionId: string
    ): Promise<boolean> {
        const session = await this.getSession(userId);

        if (!session) return false;

        // 🔥 single-device enforcement
        if (session.sessionId !== sessionId) {
            return false;
        }

        if (session.expiresAt < Date.now()) {
            await this.deleteSession(userId);
            return false;
        }

        return true;
    }

    // 🔹 logout (user or admin)
    async deleteSession(userId: string): Promise<void> {
        await cacheManager.del(this.getSessionKey(userId));
    }

    // 🔹 optional helper
    async hasActiveSession(userId: string): Promise<boolean> {
        const session = await this.getSession(userId);
        return !!session && session.expiresAt > Date.now();
    }
}

export default new SessionService();

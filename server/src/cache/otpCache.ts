import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import logger from "src/utils/logger.js";

// =====================
// OTP DATA INTERFACE
// =====================

export interface OtpData {
    hashedOtp: string;
    createdAt: number;
    expiresAt: number;
}

// =====================
// OTP TYPES
// =====================

export type OtpType = "register" | "resetPassword" | "login" | "verify";

// =====================
// OTP CACHE SERVICE
// =====================

class OtpCacheService {
    private getOtpKey(email: string, type: OtpType): string {
        switch (type) {
            case "register":
                return cacheKeyFactory.otp.register(email);
            case "resetPassword":
                return cacheKeyFactory.otp.resetPassword(email);
            case "login":
                return cacheKeyFactory.otp.login(email);
            default:
                return cacheKeyFactory.otp.verify(email);
        }
    }

    private getOtpTTL(): number {
        return TTL.OTP; // 5 minutes
    }

    // =====================
    // SET OTP
    // =====================

    /**
     * Store hashed OTP in Redis with TTL
     */
    async setOtp(
        email: string,
        hashedOtp: string,
        type: OtpType
    ): Promise<void> {
        const now = Date.now();
        const ttl = this.getOtpTTL();

        const otpData: OtpData = {
            hashedOtp,
            createdAt: now,
            expiresAt: now + ttl * 1000,
        };

        await cacheManager.set(this.getOtpKey(email, type), otpData, ttl);
        logger.info(`OTP stored for ${email} (${type})`);
    }

    // =====================
    // GET OTP
    // =====================

    /**
     * Retrieve OTP data from Redis
     */
    async getOtp(email: string, type: OtpType): Promise<OtpData | null> {
        const otpData = await cacheManager.get<OtpData>(
            this.getOtpKey(email, type)
        );

        if (!otpData) {
            return null;
        }

        // Check if OTP has expired
        if (otpData.expiresAt < Date.now()) {
            await this.deleteOtp(email, type);
            return null;
        }

        return otpData;
    }

    // =====================
    // VERIFY OTP EXISTS
    // =====================

    /**
     * Check if OTP exists and is not expired
     */
    async hasValidOtp(email: string, type: OtpType): Promise<boolean> {
        const otpData = await this.getOtp(email, type);
        return !!otpData;
    }

    // =====================
    // DELETE OTP
    // =====================

    /**
     * Delete OTP from Redis (after successful verification)
     */
    async deleteOtp(email: string, type: OtpType): Promise<void> {
        await cacheManager.del(this.getOtpKey(email, type));
        logger.info(`OTP deleted for ${email} (${type})`);
    }

    // =====================
    // DELETE ALL OTPs FOR USER
    // =====================

    /**
     * Delete all OTPs for a user (useful on account deletion)
     */
    async deleteAllOtps(email: string): Promise<void> {
        await Promise.all([
            this.deleteOtp(email, "register"),
            this.deleteOtp(email, "resetPassword"),
        ]);
    }
}

const otpCache = new OtpCacheService();
export default otpCache;

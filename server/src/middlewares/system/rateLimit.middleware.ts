import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "src/configs/redis.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (command: string, ...args: string[]) =>
            redis.call(command, args) as never,
    }),
    message: {
        success: false,
        error: {
            code: ERROR_CODE.RATE_LIMIT_EXCEEDED,
            message: "Too many requests. Please try again later.",
            details: [],
        },
    },
});


export const authRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: false, // count all requests
    message: {
        success: false,
        error: {
            code: ERROR_CODE.RATE_LIMIT_EXCEEDED,
            message: "Too many requests. Please try again later.",
            details: [],
        },
    },
});

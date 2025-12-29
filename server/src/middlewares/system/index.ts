import type { Express } from "express";
import { securityMiddleware } from "./security.middleware.js";
import { corsMiddleware } from "./cors.middleware.js";
import { hppMiddleware } from "./hpp.middleware.js";
import { xssMiddleware } from "./xss.middleware.js";
import { compressionMiddleware } from "./compression.middleware.js";
import { cookieMiddleware } from "./cookie.middleware.js";
import { apiRateLimiter } from "./rateLimit.middleware.js";

export const applyMiddlewares = (app: Express) => {
    securityMiddleware(app);
    corsMiddleware(app);
    hppMiddleware(app);
    xssMiddleware(app);
    compressionMiddleware(app);
    cookieMiddleware(app);

    // Apply rate limiter ONLY to API links
};

import xss from "xss";
import type { Express, Request, Response, NextFunction } from "express";

/**
 * Recursively sanitize all string values in an object
 */
const sanitize = (obj: any, ignoreKeys: string[] = []): any => {
    if (typeof obj === "string") {
        return xss(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item, ignoreKeys));
    }
    if (obj && typeof obj === "object") {
        const sanitized: Record<string, any> = {};
        for (const key in obj) {
            if (ignoreKeys.includes(key)) {
                sanitized[key] = obj[key];
            } else {
                sanitized[key] = sanitize(obj[key], ignoreKeys);
            }
        }
        return sanitized;
    }
    return obj;
};

export const xssMiddleware = (app: Express) => {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (req.body) {
            const ignoreKeys: string[] = [];

            // Skip XSS sanitization for HTML content fields in specific routes
            if (req.originalUrl.includes("/campaigns") || req.originalUrl.includes("/ai/")) {
                ignoreKeys.push("content");
            }

            req.body = sanitize(req.body, ignoreKeys);
        }
        next();
    });
};

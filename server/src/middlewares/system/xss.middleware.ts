import xss from "xss";
import type { Express, Request, Response, NextFunction } from "express";

/**
 * Recursively sanitize all string values in an object
 */
const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
        return xss(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
        const sanitized: Record<string, any> = {};
        for (const key in obj) {
            sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
    }
    return obj;
};

export const xssMiddleware = (app: Express) => {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if (req.body) {
            req.body = sanitize(req.body);
        }
        next();
    });
};

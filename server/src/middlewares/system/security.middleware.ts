import helmet from "helmet";
import type { Express } from "express";

export const securityMiddleware = (app: Express) => {
    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        })
    );
};

import compression from "compression";
import type { Express } from "express";

export const compressionMiddleware = (app: Express) => {
    app.use(
        compression({
            level: 6,
            threshold: 1024, // compress only > 1KB
        })
    );
};

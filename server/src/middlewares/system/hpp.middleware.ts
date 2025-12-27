import hpp from "hpp";
import type { Express } from "express";

export const hppMiddleware = (app: Express) => {
    app.use(hpp());
};

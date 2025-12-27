import cors from "cors";
import type { Express } from "express";
import { env } from "src/configs/env.js";

export const corsMiddleware = (app: Express) => {
    app.use(
        cors({
            origin: env.CLIENT_ORIGIN.split(","),
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        })
    );
};

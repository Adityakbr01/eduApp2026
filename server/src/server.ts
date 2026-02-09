import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./db/mongo.js";
import logger from "./utils/logger.js";
import { isProd } from "./configs/env.js";
import { startAggregationWorker } from "./workers/aggregationWorker.js";
import { initSocket } from "./Socket/socket.js";

dotenv.config();

// ---------------- ERROR HANDLING ----------------
process.on("uncaughtException", (err: Error) => {
    logger.error("UNCAUGHT EXCEPTION 💥", {
        message: err.message,
        stack: err.stack,
    });
    process.exit(1);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

let server: http.Server;

// ---------------- START SERVER ----------------
const startServer = async () => {
    try {
        // ✅ CREATE HTTP SERVER MANUALLY
        server = http.createServer(app);

        // ✅ INIT SOCKET.IO BEFORE LISTEN
        await initSocket(server);

        // ✅ NOW LISTEN
        server.listen(PORT, "0.0.0.0", async () => {
            await connectDB();

            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`Server Start in ${isProd}`);
        });

        startAggregationWorker();

    } catch (error) {
        logger.error("❌ Server failed to start", error);
        process.exit(1);
    }
};

startServer();

// ---------------- PROMISE REJECTION ----------------
process.on("unhandledRejection", (reason: any) => {
    logger.error("UNHANDLED REJECTION 💥", reason);
    process.exit(1);
});

// ---------------- GRACEFUL SHUTDOWN ----------------
const shutdown = (signal: string) => {
    logger.warn(`🛑 ${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            logger.info("✅ Server closed successfully");
            process.exit(0);
        });
    }

    setTimeout(() => {
        logger.error("❌ Force shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

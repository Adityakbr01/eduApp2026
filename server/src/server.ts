import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/mongo.js";
import logger from "./utils/logger.js";
import { isProd } from "./configs/env.js";
import { startAggregationWorker } from "./workers/aggregationWorker.js";
import { initSocket } from "./socket.js";
// import { startVideoWorker } from "../../video-pipline/workers/videoProcessor.worker.js";

// Load environment variables
dotenv.config();

// Handle sync errors (VERY IMPORTANT)
process.on("uncaughtException", (err: Error) => {
    logger.error("UNCAUGHT EXCEPTION 💥", {
        message: err.message,
        stack: err.stack,
    });
    process.exit(1);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

let server: any;

const startServer = () => {
    try {
        server = app.listen(PORT, async () => {
            //connect to database here
            await connectDB();

            // Initialize Socket.IO with Redis Adapter (awaiting connection)
            await initSocket(server);

            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`Server Start in ${isProd}`)
        });
        // startVideoWorker();
        startAggregationWorker();
    } catch (error) {
        logger.error("❌ Server failed to start", error);
        process.exit(1);
    }

};

startServer();

// Handle async promise rejections
process.on("unhandledRejection", (reason: any) => {
    logger.error("UNHANDLED REJECTION 💥", reason);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

// Graceful shutdown (PM2 / Docker / EC2)
const shutdown = (signal: string) => {
    logger.warn(`🛑 ${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            logger.info("✅ Server closed successfully");
            process.exit(0);
        });
    }

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error("❌ Force shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

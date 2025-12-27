import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { env } from "process";

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI, {
            autoIndex: true, // auto-create indexes (disable in prod if needed)
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // IPv4
        });

        logger.info("🟢 MongoDB connected");
    } catch (err) {
        logger.error("❌ MongoDB connection failed:", err);
        process.exit(1); // fail fast
    }
};

// Handle graceful shutdown
mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️ MongoDB disconnected!");
});

process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed due to app termination");
    process.exit(0);
});

export default connectDB;

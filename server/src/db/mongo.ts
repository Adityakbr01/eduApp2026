import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { env } from "process";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI!, {
      autoIndex: env.NODE_ENV !== "production", // disable in prod to avoid duplicate index warnings
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    logger.info("🟢 MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

// Mongo disconnected warning
mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected!");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed due to app termination");
  process.exit(0);
});

export default connectDB;

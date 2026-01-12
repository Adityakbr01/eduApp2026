import dotenv from "dotenv";
dotenv.config();
import { startVideoWorker } from "./workers/videoProcessor.worker";

// 🔥 START WORKER
startVideoWorker().catch((err) => {
  console.error("❌ Worker crashed:", err);
  process.exit(1);
});
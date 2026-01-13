import dotenv from "dotenv";
dotenv.config();

import { startVideoScheduler } from "./workers/videoProcessor.worker";

// 🔥 START WORKER
startVideoScheduler().catch((err: any) => {
  console.error("❌ Worker crashed:", err);
  process.exit(1);
});
import fs from "fs";
import path from "path";

// 🔍 Show current working directory
console.log("📁 Current working directory:", process.cwd());

// ✅ Load dotenv **only in dev**
if (process.env.NODE_ENV !== "production") {
  import('dotenv').then(dotenv => {
    const envPath = path.resolve(process.cwd(), ".env");
    console.log("📄 .env path:", envPath, "exists?", fs.existsSync(envPath));

    dotenv.config({ path: envPath });
    console.log("✅ Loaded .env for development");
  });
}

import { startVideoScheduler } from "./workers/videoProcessor.worker";

// 🔥 START WORKER
startVideoScheduler().catch((err: any) => {
  console.error("❌ Worker crashed:", err);
  process.exit(1);
});

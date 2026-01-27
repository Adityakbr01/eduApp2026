import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// 🔍 Show current working directory
console.log("📁 Current working directory:", process.cwd());

// 🔍 Check if .env exists
const envPath = path.resolve(process.cwd(), ".env");
console.log("📄 .env path:", envPath, "exists?", fs.existsSync(envPath));

// Load dotenv
dotenv.config({ path: envPath });

// 🔍 Log all envs of interest
console.log("🔍 Loaded ENV variables:");
[
  "VIDEO_BUCKET_TEMP",
  "VIDEO_BUCKET_PROD",
  "AWS_REGION",
  "MONGODB_DB_NAME",
  "DYNAMO_TABLE",
  "SQS_QUEUE_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "ECS_CLUSTER",
  "ECS_TASK_DEFINITION",
  "ECS_TASK_FAMILY",
  "ECS_SUBNETS",
  "ECS_SECURITY_GROUPS"
].forEach(key => {
  console.log(`${key}:`, process.env[key]);
});

import { startVideoScheduler } from "./workers/videoProcessor.worker";

// 🔥 START WORKER
startVideoScheduler().catch((err: any) => {
  console.error("❌ Worker crashed:", err);
  process.exit(1);
});
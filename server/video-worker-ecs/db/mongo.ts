import mongoose from "mongoose";
import { log } from "../utils/logger";


export async function connectDB({ MONGODB_URI, DB_NAME }: { MONGODB_URI: string; DB_NAME: string }) {
  if (!MONGODB_URI) {
    throw new Error("❌ Missing MONGODB_URI");
  }

  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  log("INFO", "✅ MongoDB connected (ECS worker)", { db: DB_NAME });
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  log("INFO", "🛑 MongoDB disconnected (ECS worker)");
}

export async function updateVideoStatus(
  contentId: string,
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED",
  hlsKey?: string,
  durationSeconds?: number
) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  log("INFO", "🧾 Updating video status in DB", {
    contentId,
    status,
    ...(hlsKey && { hlsKey }),
    ...(durationSeconds && { durationSeconds }),
  });

  await db.collection("lessoncontents").updateOne(
    { _id: new mongoose.Types.ObjectId(contentId) },
    {
      $set: {
        "video.status": status,
        ...(hlsKey && { "video.hlsKey": hlsKey }),
        ...(durationSeconds && { "video.duration": durationSeconds }),
      },
    }
  );
}


export async function findLessonContentById(lessonContentId: string) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  log("INFO", "🔍 Finding lessonContent by lessonContentId", { lessonContentId });

  const doc = await db
    .collection("lessoncontents")
    .findOne({ _id: new mongoose.Types.ObjectId(lessonContentId) });
  if (!doc) {
    throw new Error(`LessonContent not found for lessonContentId=${lessonContentId}`);
  }

  log("INFO", "✅ LessonContent resolved", {
    lessonContentId,
  });

  return doc; // raw MongoDB document
}

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
  status: "PROCESSING" | "READY" | "FAILED",
  hlsKey?: string
) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  log("INFO", "🧾 Updating video status in DB", {
    contentId,
    status,
    ...(hlsKey && { hlsKey }),
  });

  await db.collection("lessoncontents").updateOne(
    { _id: new mongoose.Types.ObjectId(contentId) },
    {
      $set: {
        "video.status": status,
        ...(hlsKey && { "video.hlsKey": hlsKey }),
      },
    }
  );
}

export async function findLessonContentByDraftId(draftId: string) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  log("INFO", "🔍 Finding lessonContent by draftID", { draftId });

  const doc = await db
    .collection("lessoncontents")
    .findOne({ draftID: draftId });

  if (!doc) {
    throw new Error(`LessonContent not found for draftID=${draftId}`);
  }

  log("INFO", "✅ LessonContent resolved", {
    draftId,
    lessonContentId: doc._id.toString(),
  });

  return doc; // raw MongoDB document
}

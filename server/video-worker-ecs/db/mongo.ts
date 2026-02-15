import mongoose from "mongoose";
import { log } from "../utils/logger";

/**
 * Connect DB
 */
export async function connectDB({
  MONGODB_URI,
  DB_NAME,
}: {
  MONGODB_URI: string;
  DB_NAME: string;
}) {
  if (!MONGODB_URI) {
    throw new Error("❌ Missing MONGODB_URI");
  }

  if (mongoose.connection.readyState === 1) {
    log("INFO", "ℹ️ Mongo already connected");
    return;
  }

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });

  log("INFO", "✅ MongoDB connected (ECS worker)", {
    db: DB_NAME,
  });
}

/**
 * Disconnect DB
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    log("INFO", "ℹ️ Mongo already disconnected");
    return;
  }

  await mongoose.disconnect();
  log("INFO", "🛑 MongoDB disconnected (ECS worker)");
}

/**
 * Update Video Status
 */
export async function updateVideoStatus(
  contentId: string,
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED",
  hlsKey?: string,
  durationSeconds?: number
) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new Error("Invalid contentId");
  }

  const updatePayload: Record<string, any> = {
    "video.status": status,
  };

  // Important: !== undefined (0 should be allowed)
  if (hlsKey !== undefined) {
    updatePayload["video.hlsKey"] = hlsKey;
  }

  if (durationSeconds !== undefined) {
    updatePayload["video.duration"] = Math.round(durationSeconds);
  }

  log("INFO", "🧾 Updating video status in DB", {
    contentId,
    updatePayload,
  });

  const result = await db.collection("lessoncontents").updateOne(
    { _id: new mongoose.Types.ObjectId(contentId) },
    {
      $set: updatePayload,
    }
  );

  log("INFO", "📦 Update result", {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });

  if (result.matchedCount === 0) {
    throw new Error("LessonContent not found");
  }

  log("INFO", "✅ Video status updated successfully");
}

/**
 * Find LessonContent
 */
export async function findLessonContentById(lessonContentId: string) {
  const db = mongoose.connection.db;
  if (!db) throw new Error("DB not connected");

  if (!mongoose.Types.ObjectId.isValid(lessonContentId)) {
    throw new Error("Invalid lessonContentId");
  }

  log("INFO", "🔍 Finding lessonContent by ID", {
    lessonContentId,
  });

  const doc = await db
    .collection("lessoncontents")
    .findOne({
      _id: new mongoose.Types.ObjectId(lessonContentId),
    });

  if (!doc) {
    throw new Error(
      `LessonContent not found for lessonContentId=${lessonContentId}`
    );
  }

  log("INFO", "✅ LessonContent resolved", {
    lessonContentId,
    videoStatus: doc?.video?.status,
  });

  return doc;
}

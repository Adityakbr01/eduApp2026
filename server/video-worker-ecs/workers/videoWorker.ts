import fs from "fs";
import path from "path";

import {
  downloadFromS3,
  uploadDirectory,
  deleteS3Object,
} from "../aws/s3";
import { generateHLS } from "../ffmpeg/generateHLS";
import { log } from "../utils/logger";

import extractCourseAndLessonId from "../utils/extractCourseAndLessonId";
import joinS3Key from "../utils/joinS3Key";

import {
  connectDB,
  disconnectDB,
  updateVideoStatus,
  findLessonContentByDraftId,
} from "../db/mongo";

// ---------------- CONFIG ----------------
const TMP_DIR = "/tmp";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`❌ Missing env: ${name}`);
  return v;
}

const TEMP_BUCKET = requireEnv("VIDEO_BUCKET_TEMP");
const PROD_BUCKET = requireEnv("VIDEO_BUCKET_PROD");
const VIDEO_KEY = requireEnv("VIDEO_KEY");
const MONGODB_URI = requireEnv("MONGODB_URI");
const MONGODB_DB_NAME = requireEnv("MONGODB_DB_NAME");

// ---------------- HELPERS ----------------
function extractDraftId(videoKey: string): string {
  // upload/courses/.../lessons/.../lessoncontents/{draftId}/video/source.mp4
  const parts = videoKey.split("/");
  const idx = parts.indexOf("lessoncontents");

  if (idx === -1 || !parts[idx + 1]) {
    throw new Error("Invalid VIDEO_KEY: draftId not found");
  }

  return parts[idx + 1];
}

// ---------------- MAIN ----------------
async function main() {
  const { courseId, lessonId } = extractCourseAndLessonId(VIDEO_KEY);
  const draftId = extractDraftId(VIDEO_KEY);

  log("INFO", "🎬 ECS Video Worker started", {
    VIDEO_KEY,
    courseId,
    lessonId,
    draftId,
  });

  const inputPath = path.join(TMP_DIR, `${draftId}.mp4`);
  const outputDir = path.join(TMP_DIR, draftId);

  try {
    // 1️⃣ DB connect
    await connectDB({ MONGODB_URI, DB_NAME: MONGODB_DB_NAME });

    // 2️⃣ Resolve REAL lessonContentId from draftId
    const lessonContent = await findLessonContentByDraftId(draftId);
    const lessonContentId = lessonContent._id.toString();

    log("INFO", "🧠 Draft resolved to lessonContent", {
      draftId,
      lessonContentId,
    });

    // 3️⃣ STATUS → PROCESSING
    await updateVideoStatus(lessonContentId, "PROCESSING");

    // 4️⃣ Download RAW video
    log("INFO", "⬇️ Downloading raw video from TEMP", {
      bucket: TEMP_BUCKET,
      key: VIDEO_KEY,
    });
    await downloadFromS3(TEMP_BUCKET, VIDEO_KEY, inputPath);

    // 5️⃣ Generate HLS
    log("INFO", "🎞️ Generating HLS via FFmpeg", {
      lessonContentId,
    });
    await generateHLS(inputPath, outputDir);

    // 6️⃣ FINAL OUTPUT PREFIX (🔥 CORRECT)
    const OUTPUT_PREFIX = joinS3Key(
      "upload",
      "courses",
      courseId,
      "lessons",
      lessonId,
      "lessoncontents",
      lessonContentId,
      "hls"
    );

    // 7️⃣ Upload HLS to PROD
    log("INFO", "⬆️ Uploading HLS to PROD", {
      bucket: PROD_BUCKET,
      prefix: OUTPUT_PREFIX,
    });

    await uploadDirectory(
      outputDir,
      PROD_BUCKET,
      "", // ❗ no nesting
      OUTPUT_PREFIX
    );

    const hlsKey = joinS3Key(OUTPUT_PREFIX, "master.m3u8");

    // 8️⃣ STATUS → READY
    log("INFO", "📺 HLS READY", { hlsKey });
    await updateVideoStatus(lessonContentId, "READY", hlsKey);

    // 9️⃣ Delete TEMP raw video
    try {
      await deleteS3Object(TEMP_BUCKET, VIDEO_KEY);
      log("INFO", "🗑️ Deleted TEMP raw video", {
        bucket: TEMP_BUCKET,
        key: VIDEO_KEY,
      });
    } catch (err) {
      log("WARN", "⚠️ Failed to delete TEMP video (non-fatal)", {
        key: VIDEO_KEY,
        error: err,
      });
    }

    // 🔟 Local cleanup
    fs.rmSync(inputPath, { force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });

    log("INFO", "✅ Video processing completed successfully", {
      lessonContentId,
      hlsKey,
    });

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    log("ERROR", "❌ Video processing failed", {
      VIDEO_KEY,
      error: err,
    });

    try {
      const lessonContent = await findLessonContentByDraftId(
        extractDraftId(VIDEO_KEY)
      );
      await updateVideoStatus(
        lessonContent._id.toString(),
        "FAILED"
      );
    } catch {}

    await disconnectDB();
    process.exit(1);
  }
}

// 🚀 RUN
main();

import fs from "fs";
import path from "path";
import { downloadFromS3, uploadDirectory } from "../aws/s3";
import { generateHLS } from "../ffmpeg/generateHLS";
import { log } from "../utils/logger";

const TMP_DIR = "/tmp";

// 🔥 NO DEFAULTS — FAIL FAST
const REGION = process.env.AWS_REGION!;
const TEMP_BUCKET = process.env.VIDEO_BUCKET_TEMP!;
const PROD_BUCKET = process.env.VIDEO_BUCKET_PROD!;
const VIDEO_KEY = process.env.VIDEO_KEY!;
const VIDEO_ID = process.env.VIDEO_ID!;

const OUTPUT_PREFIX_BASE = "hls";

async function main() {
  log("INFO", "🎬 Video ECS worker started", {
    REGION,
    TEMP_BUCKET,
    PROD_BUCKET,
    VIDEO_KEY,
    VIDEO_ID,
  });

  try {
    const inputPath = path.join(TMP_DIR, `${VIDEO_ID}.mp4`);
    const outputDir = path.join(TMP_DIR, VIDEO_ID);

    // 1️⃣ Download from TEMP bucket
    log("INFO", "⬇️ Downloading input video", {
      bucket: TEMP_BUCKET,
      key: VIDEO_KEY,
    });

    await downloadFromS3(TEMP_BUCKET, VIDEO_KEY, inputPath);

    // 2️⃣ Generate HLS
    log("INFO", "🎞️ Generating HLS via FFmpeg", {
      videoId: VIDEO_ID,
    });

    await generateHLS(inputPath, outputDir);

    // 3️⃣ Upload ONLY to PROD bucket
    log("INFO", "⬆️ Uploading HLS output", {
      bucket: PROD_BUCKET,
      videoId: VIDEO_ID,
    });

    await uploadDirectory(
      outputDir,
      PROD_BUCKET,
      VIDEO_ID,
      OUTPUT_PREFIX_BASE
    );

    // 4️⃣ Cleanup
    fs.rmSync(inputPath, { force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });

    log("INFO", "✅ Video processed successfully", { VIDEO_ID });
    process.exit(0);
  } catch (err) {
    log("ERROR", "❌ Video processing failed", {
      VIDEO_ID,
      error: err,
    });
    process.exit(1);
  }
}

// Run immediately
main();

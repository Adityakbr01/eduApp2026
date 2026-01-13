import fs from "fs";
import path from "path";

import {
  SQSClient,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import {
  DynamoDBClient,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

import {
  downloadFromS3,
  uploadDirectory,
  deleteS3Object,
} from "../aws/s3";

import { generateHLS } from "../ffmpeg/generateHLS";
import { log } from "../utils/logger";

import extractCourseAndLessonId from "../utils/extractCourseAndLessonId";
import joinS3Key from "../utils/joinS3Key";
import { startHeartbeat, stopHeartbeat } from "../utils/heartBeat";

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

// Required ENV
const AWS_REGION = requireEnv("AWS_REGION");
const TEMP_BUCKET = requireEnv("VIDEO_BUCKET_TEMP");
const PROD_BUCKET = requireEnv("VIDEO_BUCKET_PROD");
const VIDEO_KEY = requireEnv("VIDEO_KEY");
const VIDEO_ID = requireEnv("VIDEO_ID");

const SQS_QUEUE_URL = requireEnv("SQS_QUEUE_URL");
const SQS_RECEIPT_HANDLE = requireEnv("SQS_RECEIPT_HANDLE");

const MONGODB_URI = requireEnv("MONGODB_URI");
const MONGODB_DB_NAME = requireEnv("MONGODB_DB_NAME");
const DYNAMO_TABLE = requireEnv("DYNAMO_TABLE");

// AWS clients
const sqs = new SQSClient({ region: AWS_REGION });
export const ddb = new DynamoDBClient({ region: AWS_REGION });


// Heartbeat config
export const HEARTBEAT_INTERVAL = 120; // 2 min
export const LOCK_EXTEND_SECONDS = 15 * 60; // 15 min


// ---------------- HELPERS ----------------
function extractDraftId(videoKey: string): string {
  const parts = videoKey.split("/");
  const idx = parts.indexOf("lessoncontents");
  if (idx === -1 || !parts[idx + 1]) {
    throw new Error("Invalid VIDEO_KEY: draftId not found");
  }
  return parts[idx + 1];
}

async function markJobDone(videoId: string) {
  await ddb.send(
    new UpdateItemCommand({
      TableName: DYNAMO_TABLE,
      Key: { videoId: { S: videoId } },
      UpdateExpression: "SET #s = :d",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":d": { S: "DONE" } },
    })
  );
}

async function markJobFailed(videoId: string) {
  await ddb.send(
    new UpdateItemCommand({
      TableName: DYNAMO_TABLE,
      Key: { videoId: { S: videoId } },
      UpdateExpression: "SET #s = :f",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":f": { S: "FAILED" } },
    })
  );
}

async function deleteSqsMessage() {
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: SQS_RECEIPT_HANDLE,
    })
  );
}




// ---------------- MAIN ----------------
async function main() {
  const { courseId, lessonId } =
    extractCourseAndLessonId(VIDEO_KEY);

  const draftId = extractDraftId(VIDEO_KEY);

  log("INFO", "🎬 ECS Video Worker started", {
    VIDEO_KEY,
    VIDEO_ID,
    courseId,
    lessonId,
    draftId,
  });

  const inputPath = path.join("/tmp", `${draftId}.mp4`);
  const outputDir = path.join("/tmp", draftId);

  try {
    await connectDB({
      MONGODB_URI,
      DB_NAME: MONGODB_DB_NAME,
    });

    const lessonContent =
      await findLessonContentByDraftId(draftId);

    const lessonContentId =
      lessonContent._id.toString();

    await updateVideoStatus(
      lessonContentId,
      "PROCESSING"
    );

    // ❤️ START HEARTBEAT
    startHeartbeat(VIDEO_ID,DYNAMO_TABLE);

    await downloadFromS3(
      TEMP_BUCKET,
      VIDEO_KEY,
      inputPath
    );

    await generateHLS(inputPath, outputDir);

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

    await uploadDirectory(
      outputDir,
      PROD_BUCKET,
      "",
      OUTPUT_PREFIX
    );

    const hlsKey = joinS3Key(
      OUTPUT_PREFIX,
      "master.m3u8"
    );

    await updateVideoStatus(
      lessonContentId,
      "READY",
      hlsKey
    );

    await deleteS3Object(
      TEMP_BUCKET,
      VIDEO_KEY
    ).catch(() => {});

    fs.rmSync(inputPath, { force: true });
    fs.rmSync(outputDir, {
      recursive: true,
      force: true,
    });

    // 🛑 STOP HEARTBEAT
    stopHeartbeat();

    await markJobDone(VIDEO_ID);
    await deleteSqsMessage();

    log("INFO", "✅ Video processing DONE", {
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

    stopHeartbeat();

    try {
      const lessonContent =
        await findLessonContentByDraftId(draftId);

      await updateVideoStatus(
        lessonContent._id.toString(),
        "FAILED"
      );
    } catch {}

    await markJobFailed(VIDEO_ID).catch(() => {});
    await disconnectDB();
    process.exit(1);
  }
}

// 🚀 RUN
main();

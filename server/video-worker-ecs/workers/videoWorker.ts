import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { deleteS3Object, downloadFromS3, uploadDirectory } from "../aws/s3";
import {
  connectDB,
  disconnectDB,
  findLessonContentById,
  updateVideoStatus,
} from "../db/mongo";
import { generateHLS } from "../ffmpeg/generateHLS";
import { startHeartbeat, stopHeartbeat } from "../utils/heartBeat";
import { AwsCredentialIdentity } from "@smithy/types";
import { parseVideoKey } from "../utils/parseVideoKey";
import { buildHlsOutputPrefix } from "../utils/buildHlsOutputPrefix";

/* -------------------------------------------------- */
/* ENV VALIDATION                                     */
/* -------------------------------------------------- */

const REQUIRED_ENVS = [
  "AWS_REGION",
  "VIDEO_BUCKET_TEMP",
  "VIDEO_BUCKET_PROD",
  "VIDEO_KEY",
  "SQS_RECEIPT_HANDLE",
  "SQS_QUEUE_URL",
  "MONGODB_URI",
  "MONGODB_DB_NAME",
  "DYNAMO_TABLE",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
];

const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Missing required env variables:", missing);
  process.exit(1);
}

export const AWS_REGION = process.env.AWS_REGION!;
const TEMP_BUCKET = process.env.VIDEO_BUCKET_TEMP!;
const PROD_BUCKET = process.env.VIDEO_BUCKET_PROD!;
const VIDEO_KEY = process.env.VIDEO_KEY!;
const SQS_RECEIPT_HANDLE = process.env.SQS_RECEIPT_HANDLE!;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL!;
const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;
const DYNAMO_TABLE = process.env.DYNAMO_TABLE!;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

console.log("🚀 Video Worker ENV loaded successfully");

/* -------------------------------------------------- */
/* AWS CLIENTS                                        */
/* -------------------------------------------------- */

export const credentials: AwsCredentialIdentity = {
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
};

const sqs = new SQSClient({ region: AWS_REGION, credentials });
const ddb = new DynamoDBClient({ region: AWS_REGION, credentials });

/* -------------------------------------------------- */
/* HELPERS                                            */
/* -------------------------------------------------- */

async function deleteSqsMessage() {
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: SQS_RECEIPT_HANDLE,
    })
  );
}

async function markJobStatus(
  lessonContentId: string,
  status: "DONE" | "FAILED"
) {
  const now = Math.floor(Date.now() / 1000);

  await ddb.send(
    new UpdateItemCommand({
      TableName: DYNAMO_TABLE,
      Key: { videoId: { S: lessonContentId } },
      UpdateExpression:
        "SET #s = :s, updatedAt = :now REMOVE lockTTL, lockedBy",
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":s": { S: status },
        ":now": { N: now.toString() },
      },
    })
  );
}

/* -------------------------------------------------- */
/* MAIN                                               */
/* -------------------------------------------------- */

export async function main() {
  const { courseId, lessonId, lessonContentId, version } =
    parseVideoKey(VIDEO_KEY);

  console.log("🎬 Video Worker started", {
    courseId,
    lessonId,
    lessonContentId,
    version,
  });

  const inputPath = `/tmp/${lessonContentId}.mp4`;
  const outputDir = `/tmp/${lessonContentId}`;

  try {
    /* 1️⃣ Mongo Connect */
    await connectDB({
      MONGODB_URI,
      DB_NAME: MONGODB_DB_NAME,
    });

    /* 2️⃣ Validate lesson content */
    const lessonContent = await findLessonContentById(lessonContentId);
    if (!lessonContent) {
      throw new Error(`LessonContent not found: ${lessonContentId}`);
    }

    /* 3️⃣ Mark PROCESSING */
    await updateVideoStatus(lessonContentId, "PROCESSING");

    /* 4️⃣ Start heartbeat */
    startHeartbeat(lessonContentId, DYNAMO_TABLE);

    /* 5️⃣ Download → Transcode */
    await downloadFromS3(TEMP_BUCKET, VIDEO_KEY, inputPath);
    await generateHLS(inputPath, outputDir);

    /* 6️⃣ Upload HLS */
    const outputPrefix = buildHlsOutputPrefix({
      courseId,
      lessonId,
      lessonContentId,
      version,
    });

    await uploadDirectory(outputDir, PROD_BUCKET, "", outputPrefix);

    /* 7️⃣ Mark READY */
    const masterUrl = `${outputPrefix}/master.m3u8`;
    await updateVideoStatus(lessonContentId, "READY", masterUrl);

    /* 8️⃣ Cleanup */
    await deleteS3Object(TEMP_BUCKET, VIDEO_KEY).catch(() => {});
    await markJobStatus(lessonContentId, "DONE");
    await deleteSqsMessage();

    stopHeartbeat();
    await disconnectDB();

    console.log("✅ Video processing DONE", {
      lessonContentId,
      masterUrl,
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Video processing FAILED", err);

    stopHeartbeat();
    await markJobStatus(lessonContentId, "FAILED").catch(() => {});
    await disconnectDB();

    process.exit(1);
  }
}

main();

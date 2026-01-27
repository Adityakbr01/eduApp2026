import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { deleteS3Object, downloadFromS3, uploadDirectory } from "../aws/s3";
import {
  connectDB,
  disconnectDB,
  findLessonContentByDraftId,
  updateVideoStatus,
} from "../db/mongo";
import { generateHLS } from "../ffmpeg/generateHLS";
import { startHeartbeat, stopHeartbeat } from "../utils/heartBeat";
import { AwsCredentialIdentity } from "@smithy/types/dist-types/identity/awsCredentialIdentity";

// ---------------- utils ----------------
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`❌ Missing env: ${name}`);
  return v;
}


const requiredEnvs = [
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

const missing = requiredEnvs.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error("❌ Missing required env variables:", missing);
  process.exit(1); // fail ECS container
}



function extractDraftIdFromKey(key: string): string {
  const parts = key.split("/");
  const idx = parts.indexOf("lessoncontents");
  if (idx === -1 || !parts[idx + 1]) {
    throw new Error(`Invalid VIDEO_KEY, draftId not found: ${key}`);
  }
  return parts[idx + 1];
}

// ---------------- ENV ----------------
export const AWS_REGION = requireEnv("AWS_REGION");
const TEMP_BUCKET = requireEnv("VIDEO_BUCKET_TEMP");
const PROD_BUCKET = requireEnv("VIDEO_BUCKET_PROD");
const VIDEO_KEY = requireEnv("VIDEO_KEY");
const ACCESS_KEY_ID = requireEnv("AWS_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = requireEnv("AWS_SECRET_ACCESS_KEY");

// const SQS_QUEUE_URL = requireEnv("SQS_QUEUE_URL");
const SQS_RECEIPT_HANDLE = requireEnv("SQS_RECEIPT_HANDLE");
const SQS_QUEUE_URL = requireEnv("SQS_QUEUE_URL");

const MONGODB_URI = requireEnv("MONGODB_URI");
const MONGODB_DB_NAME = requireEnv("MONGODB_DB_NAME");
const DYNAMO_TABLE = requireEnv("DYNAMO_TABLE");


// ---------------- DEBUG ----------------
// Log all envs at startup
console.log("🚀 Video Worker ENV values:");
[
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
].forEach((name) => {
  console.log(`  ${name}:`, process.env[name] ?? "⚠️ MISSING");
});

export const credentialsLocal: AwsCredentialIdentity = {
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
};

// ---------------- clients ----------------
const sqs = new SQSClient({ region: AWS_REGION, credentials: credentialsLocal });
const ddb = new DynamoDBClient({ region: AWS_REGION, credentials: credentialsLocal });

// ---------------- helpers ----------------
async function deleteSqsMessage() {
  await sqs.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: SQS_RECEIPT_HANDLE,
    })
  );
}

async function markJobStatus(
  draftId: string,
  status: "DONE" | "FAILED"
) {
  const now = Math.floor(Date.now() / 1000);

  await ddb.send(
    new UpdateItemCommand({
      TableName: DYNAMO_TABLE,
      Key: { videoId: { S: draftId } },
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

// ---------------- MAIN ----------------
export async function main() {
  const draftId = extractDraftIdFromKey(VIDEO_KEY);

  console.log("🎬 ECS Video Worker started", { draftId });

  const inputPath = `/tmp/${draftId}.mp4`;
  const outputDir = `/tmp/${draftId}`;

  try {
    // 1️⃣ DB connect
    await connectDB({
      MONGODB_URI,
      DB_NAME: MONGODB_DB_NAME,
    });

    // 2️⃣ Resolve lesson
    const lesson = await findLessonContentByDraftId(draftId);

    // 3️⃣ Mark PROCESSING
    await updateVideoStatus(lesson._id.toString(), "PROCESSING");

    // 4️⃣ Start heartbeat ONLY now
    startHeartbeat(draftId, DYNAMO_TABLE);

    // 5️⃣ Download + process
    await downloadFromS3(TEMP_BUCKET, VIDEO_KEY, inputPath);
    await generateHLS(inputPath, outputDir);

    const outputPrefix = `prod/${lesson._id.toString()}/hls`;

    await uploadDirectory(outputDir, PROD_BUCKET, "", outputPrefix);

    await updateVideoStatus(
      lesson._id.toString(),
      "READY",
      `${outputPrefix}/master.m3u8`
    );

    // 6️⃣ Cleanup
    await deleteS3Object(TEMP_BUCKET, VIDEO_KEY).catch(() => {});
    await markJobStatus(draftId, "DONE");
    await deleteSqsMessage();

    stopHeartbeat();
    await disconnectDB();

    console.log("✅ Video processing DONE", { draftId });
    process.exit(0);

  } catch (err) {
    console.error("❌ Video processing FAILED", err);

    stopHeartbeat();
    await markJobStatus(draftId, "FAILED").catch(() => {});
    await disconnectDB();

    // ❗ SQS message NOT deleted → retry
    process.exit(1);
  }
}

main();

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { log } from "../utils/logger";
import{ credentialsLocal as credentials} from "./sqs";


const s3 = new S3Client({
  region: process.env.AWS_REGION! || "us-east-1",
  credentials:credentials
});

/**
 * Download single object from S3
 */
export async function downloadFromS3(
  bucket: string,
  key: string,
  dest: string
) {
  log("INFO", "⬇️ Downloading from S3", { bucket, key });

  const res = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!res.Body) {
    throw new Error("S3 object body is empty");
  }

  await pipeline(res.Body as any, fs.createWriteStream(dest));
}

/**
 * Upload entire directory to S3 (PURE FUNCTION)
 */
function joinS3Key(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .join("/");
}

export async function uploadDirectory(
  localDir: string,
  bucket: string,
  jobId: string,
  outputPrefix: string
) {
  log("INFO", "⬆️ Starting directory upload to S3", {
    bucket,
    jobId: jobId || "(none)",
    outputPrefix,
    localDir,
  });

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir).flatMap((file) => {
      const fullPath = path.join(dir, file);
      return fs.statSync(fullPath).isDirectory()
        ? walk(fullPath)
        : [fullPath];
    });

  const files = walk(localDir);

  log("INFO", "📂 Files discovered for upload", {
    count: files.length,
  });

  for (const filePath of files) {
   const relativePath = path
  .relative(localDir, filePath)
  .replace(/\\/g, "/")
  .replace(/^\/+/, ""); // 🔥 THIS LINE

   const s3Key = joinS3Key(outputPrefix, relativePath);


    log("INFO", "⬆️ Uploading file to S3", {
      bucket,
      s3Key,
      file: relativePath,
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: fs.createReadStream(filePath),
        ContentType: getContentType(filePath),
      })
    );
  }

  log("INFO", "✅ Directory upload completed", {
    bucket,
    outputPrefix,
    filesUploaded: files.length,
  });
}


/**
 * Optional cleanup
 */
export async function deleteS3Object(bucket: string, key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}


/**
 * Content-Type helper
 */
function getContentType(filePath: string) {
  if (filePath.endsWith(".m3u8")) {
    return "application/vnd.apple.mpegurl";
  }
  if (filePath.endsWith(".ts")) {
    return "video/mp2t";
  }
  return "application/octet-stream";
}

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

const s3 = new S3Client({
  region: process.env.AWS_REGION,
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
export async function uploadDirectory(
  localDir: string,
  bucket: string,
  jobId: string,
  outputPrefix: string
) {
  log("INFO", "⬆️ Uploading directory to S3", {
    bucket,
    jobId,
    outputPrefix,
  });

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir).flatMap((file) => {
      const fullPath = path.join(dir, file);
      return fs.statSync(fullPath).isDirectory()
        ? walk(fullPath)
        : [fullPath];
    });

  const files = walk(localDir);

  for (const filePath of files) {
    const relativePath = path.relative(localDir, filePath);
    const s3Key = `${outputPrefix}/${jobId}/${relativePath}`.replace(
      /\\/g,
      "/"
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket, // ✅ ONLY PROD bucket comes here
        Key: s3Key,
        Body: fs.createReadStream(filePath),
        ContentType: getContentType(filePath),
      })
    );
  }
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

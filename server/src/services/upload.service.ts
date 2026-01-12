import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/configs/env.js";
import { s3 } from "src/configs/s3.js";
import { generateIntentId, getPartSize } from "src/utils/upload.utils.js";

export class UploadService {

    // ------------------- COURSE IMAGE UPLOAD -------------------
static async getCourseImagePresignedUrl(
  fileName: string,
  size: number,
  type: string,
  draftId: string
) {
  const MAX_SIZE = 5 * 1024 * 1024;

  if (!draftId) throw new Error("draftId is required");
  if (!type.startsWith("image/")) throw new Error("Only image files allowed");
  if (size > MAX_SIZE) throw new Error("Image size must be < 5MB");

  const ext = fileName.split(".").pop() || "jpg";

  const s3Key = `upload/courses/drafts/${draftId}/cover/source.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME_PROD,
    Key: s3Key,
    ContentType: type,
    Metadata: {
      entity: "course",
      draftId,
      type: "cover",
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    uploadUrl,
    intentId: s3Key,
  };
}
// ------------------- LESSON VIDEO UPLOAD -------------------
static async getLessonVideoPresignedUrl(
  fileName: string,
  size: number,
  mimeType: string,
  courseId: string,
  lessonId: string
) {
  if (!courseId || !lessonId) {
    throw new Error("courseId and lessonId are required");
  }

  if (!mimeType.startsWith("video/")) {
    throw new Error("Only video files are allowed");
  }

  const MAX_SIZE = 10 * 1024 * 1024 * 1024;
  if (size > MAX_SIZE) throw new Error("Video too large");

  const ext = fileName.split(".").pop() || "mp4";

  const s3Key =
    `upload/courses/${courseId}/lessons/${lessonId}/video/source.${ext}`;

  // SIMPLE
  if (size < 100 * 1024 * 1024) {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME, // 🔥 RAW bucket
      Key: s3Key,
      ContentType: mimeType,
      Metadata: {
        entity: "lesson-video",
        courseId,
        lessonId,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      mode: "simple",
      uploadUrl,
      intentId: s3Key,
    };
  }

  // MULTIPART
  return {
    mode: "multipart",
    intentId: s3Key,
  };
}

    static async getPresignedUrl(
        fileName: string,
        size: number,
        type: string,
        key?: string,         // optional custom key
        folder?: string       // optional folder structure
    ) {
        // ------------------- Build Key -------------------
        const baseFolder = folder ?? "uploads";  // default folder
        const uniqueSuffix = key ?? generateIntentId(fileName);

        // Example: videos/course-1/lesson-1-<uuid>.mp4
        const s3Key = `${baseFolder}/${uniqueSuffix}`;
        console.log("🚀 Generated S3 Key:", s3Key);
        // ------------------- SIMPLE UPLOAD (<5MB) -------------------
        if (size < 5 * 1024 * 1024) {
            const command = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: s3Key,
                ContentType: type,
            });

            const uploadUrl = await getSignedUrl(s3, command, {
                expiresIn: 300,
            });

            return {
                mode: "simple",
                uploadUrl,
                intentId: s3Key,  // store this key in DB
            };
        }

        console.log("🚀 Using multipart upload for file:", fileName);
        console.log("🚀 S3 Key:", s3Key);

        // ------------------- MULTIPART -------------------
        return {
            mode: "multipart",
            intentId: s3Key,  // store this key in DB
        };
    }

    static async initMultipart(intentId: string, size: number) {
        const res = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: intentId,
            })
        );

        const partSize = getPartSize(size);

        return {
            uploadId: res.UploadId!,
            partSize,
            totalParts: Math.ceil(size / partSize),
        };
    }

    static async signPart(
        intentId: string,
        uploadId: string,
        partNumber: number
    ) {
        const command = new UploadPartCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: intentId,
            UploadId: uploadId,
            PartNumber: partNumber,
        });

        return getSignedUrl(s3, command, { expiresIn: 300 });
    }

    static async completeMultipart(
        intentId: string,
        uploadId: string,
        parts: { ETag: string; PartNumber: number }[]
    ) {
        await s3.send(
            new CompleteMultipartUploadCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: intentId,
                UploadId: uploadId,
                MultipartUpload: { Parts: parts },
            })
        );

        return {
            key: intentId,
        };
    }
}

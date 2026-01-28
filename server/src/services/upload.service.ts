import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/configs/env.js";
import { s3 } from "src/configs/s3.js";
import { LessonContent } from "src/models/course/index.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { getPartSize } from "src/utils/upload.utils.js";

export class UploadService {
  // ------------------- COURSE IMAGE UPLOAD (Tested) -------------------
  static async getCourseImagePresignedUrl(
    fileName: string,
    size: number,
    type: string,
    courseId: string,
  ) {
    const MAX_SIZE = 5 * 1024 * 1024;

    if (!courseId) throw new Error("courseId is required");
    if (!type.startsWith("image/")) throw new Error("Only image files allowed");
    if (size > MAX_SIZE) throw new Error("Image size must be < 5MB");

    // 🔹 Fetch course from DB
    const course = await courseRepository.findById(courseId);
    if (!course) throw new Error("Course not found");

    const nextVersion = (course.thumbnail?.version ?? 0) + 1;

    const ext = fileName.split(".").pop() || "jpg";

    const s3Key = `prod/public/courses/${courseId}/thumbnail/v${nextVersion}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME_PROD,
      Key: s3Key,
      ContentType: type,
      CacheControl: "public, max-age=31536000",
      Metadata: {
        entity: "course",
        courseId,
        asset: "thumbnail",
        version: `v${nextVersion}`,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      uploadUrl,
      key: s3Key,
      version: nextVersion,
    };
  }

  // ------------------- LESSON VIDEO UPLOAD (Tested and if multipart return than blow functions runs ) -------------------
  static async getLessonVideoPresignedUrl(
    fileName: string,
    size: number,
    mimeType: string,
    courseId: string,
    lessonId: string,
    lessonContentId: string,
    uploaderId: string,
  ) {
    if (!mimeType.startsWith("video/")) {
      throw new Error("Only video files allowed");
    }

    const MAX_SIZE = 10 * 1024 * 1024 * 1024;
    if (size > MAX_SIZE) throw new Error("Video too large");

    // 1️⃣ Fetch current version from DB
    const lessonContent = await LessonContent.findById(lessonContentId);
    const version = (lessonContent?.video?.version ?? 0) + 1;

    // 2️⃣ Build RAW KEY (single source of truth)
    const ext = fileName.split(".").pop() ?? "mp4";

    const rawKey = [
      "upload",
      "courses",
      courseId,
      "lessons",
      lessonId,
      "lesson-contents",
      lessonContentId,
      "video",
      `source-v${version}.${ext}`,
    ].join("/");

    // 3️⃣ SIMPLE UPLOAD (<100MB)
    if (size < 100 * 1024 * 1024) {
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: rawKey,
        ContentType: mimeType,
        Metadata: {
          entity: "lesson-video",
          courseid: courseId,
          lessonid: lessonId,
          lessoncontentid: lessonContentId,
          version: String(version),
          lessonContentUploaderId: uploaderId,
        },
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

      return {
        mode: "simple",
        uploadUrl,
        rawKey,
        intentId: rawKey,
        version,
      };
    }

    // 4️⃣ MULTIPART MODE
    return {
      mode: "multipart",
      rawKey,
      intentId: rawKey,
      version,
    };
  }

  static async initMultipart(intentId: string, size: number) {
    const res = await s3.send(
      new CreateMultipartUploadCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: intentId,
      }),
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
    partNumber: number,
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
    parts: { ETag: string; PartNumber: number }[],
  ) {
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: intentId,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      }),
    );

    return {
      key: intentId,
    };
  }
}

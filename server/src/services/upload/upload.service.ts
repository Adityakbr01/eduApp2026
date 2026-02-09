import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "src/configs/env.js";
import { s3 } from "src/configs/s3.js";
import { LessonContent } from "src/models/course/index.js";
import UserModel from "src/models/user/user.model.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { getPartSize } from "src/utils/upload.utils.js";
import {
  generateUserAvatarKey,
  generateUserResumeKey,
  getCdnUrl,
} from "src/utils/s3KeyGenerator.js";
import userCache from "src/cache/userCache.js";

export class UploadService {
  // ------------------- USER AVATAR UPLOAD -------------------
  static async getUserAvatarPresignedUrl(
    userId: string,
    filename: string,
    size: number,
    mimeType: string
  ) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!mimeType.startsWith("image/")) {
      throw new Error("Only image files allowed");
    }
    if (size > MAX_SIZE) {
      throw new Error("Image size must be less than 5MB");
    }

    // Get current avatar version from user
    const user = await UserModel.findById(userId).select("profile.avatar").lean();
    const currentVersion = user?.profile?.avatar?.version ?? 0;

    // Generate versioned key
    const { key, version, publicUrl } = generateUserAvatarKey({
      userId,
      currentVersion,
      filename,
    });

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME_PROD,
      Key: key,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        entity: "user",
        userid: userId,
        asset: "avatar",
        version: `v${version}`,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      uploadUrl,
      key,
      publicUrl,
      version,
    };
  }

  // ------------------- USER RESUME UPLOAD -------------------
  static async getUserResumePresignedUrl(
    userId: string,
    filename: string,
    size: number,
    mimeType: string
  ) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (mimeType !== "application/pdf") {
      throw new Error("Only PDF files allowed for resume");
    }
    if (size > MAX_SIZE) {
      throw new Error("Resume size must be less than 10MB");
    }

    // Get current resume version from user
    const user = await UserModel.findById(userId).select("profile.resume").lean();
    const currentVersion = user?.profile?.resume?.version ?? 0;

    // Generate versioned key (private access)
    const { key, version, publicUrl } = generateUserResumeKey({
      userId,
      currentVersion,
      filename,
    });

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME_PROD,
      Key: key,
      ContentType: mimeType,
      // Note: Don't include ContentDisposition in signed request - it causes signature mismatches
      // Original filename is stored in metadata instead
      Metadata: {
        entity: "user",
        userid: userId,
        asset: "resume",
        version: `v${version}`,
        originalfilename: filename,
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      uploadUrl,
      key,
      publicUrl,
      version,
      filename,
    };
  }

  // ------------------- GET RESUME SIGNED URL (for viewing) -------------------
  static async getResumeViewUrl(userId: string) {
    const user = await UserModel.findById(userId).select("profile.resume").lean();
    
    if (!user?.profile?.resume?.key) {
      throw new Error("No resume found");
    }

    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME_PROD,
      Key: user.profile.resume.key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    return {
      url: signedUrl,
      key: user.profile.resume.key,
      version: user.profile.resume.version,
    };
  }

  // ------------------- DELETE USER RESUME -------------------
  static async deleteUserResume(userId: string) {
    const user = await UserModel.findById(userId).select("profile.resume").lean();
    
    if (!user?.profile?.resume?.key) {
      throw new Error("No resume found to delete");
    }

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME_PROD,
      Key: user.profile.resume.key,
    });

    await s3.send(command);

    // Update user profile
    await UserModel.findByIdAndUpdate(userId, {
      $unset: { "profile.resume": 1 },
    });

    return { success: true };
  }

  // ------------------- CONFIRM PROFILE UPLOAD -------------------
  static async confirmProfileUpload(
    userId: string,
    type: "avatar" | "resume",
    key: string,
    version: number,
    originalFilename?: string
  ) {
    const updateField = type === "avatar" ? "profile.avatar" : "profile.resume";
    
    const updateData: any = {
      [updateField]: {
        key,
        version,
        updatedAt: new Date(),
      },
    };

    // For resume, also store original filename
    if (type === "resume" && originalFilename) {
      updateData[`${updateField}.originalFilename`] = originalFilename;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("profile");

    // Invalidate user profile cache so next /auth/me fetches fresh avatar
    await userCache.deleteUserProfile(userId);

    return {
      success: true,
      url: getCdnUrl(key),
      version,
    };
  }

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
      rawKey: s3Key,
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

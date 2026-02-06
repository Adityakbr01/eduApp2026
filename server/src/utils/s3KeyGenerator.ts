/**
 * S3 Key Generator Utility
 * 
 * Generates scalable, versioned, and organized S3 keys for all uploads.
 * 
 * Key Structure Pattern:
 * {env}/{access}/{entity}/{entityId}/{asset-type}/v{version}.{ext}
 * 
 * Examples:
 * - prod/public/users/abc123/avatar/v1.jpg
 * - prod/private/users/abc123/resume/v2.pdf
 * - prod/public/courses/xyz789/thumbnail/v3.webp
 * - upload/courses/xyz789/lessons/lesson1/video/source-v1.mp4
 */

import { env } from "src/configs/env.js";

export type S3Environment = "prod" | "staging" | "dev" | "upload";
export type S3Access = "public" | "private";

export interface S3KeyOptions {
  environment?: S3Environment;
  access?: S3Access;
  entity: string;
  entityId: string;
  assetType: string;
  version: number;
  filename: string;
}

export interface GeneratedS3Key {
  key: string;
  version: number;
  publicUrl: string;
}

/**
 * Get current environment for S3 keys
 */
const getS3Environment = (): S3Environment => {
  const nodeEnv = env.NODE_ENV || "development";
  switch (nodeEnv) {
    case "production":
      return "prod";
    case "staging":
      return "staging";
    default:
      return "dev";
  }
};

/**
 * Extract file extension from filename
 */
const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "bin" : "bin";
};

/**
 * Generate S3 key for any asset type
 */
export const generateS3Key = (options: S3KeyOptions): GeneratedS3Key => {
  const {
    environment = getS3Environment(),
    access = "public",
    entity,
    entityId,
    assetType,
    version,
    filename,
  } = options;

  const ext = getFileExtension(filename);
  
  // Build key: {env}/{access}/{entity}/{entityId}/{assetType}/v{version}.{ext}
  const key = [
    environment,
    access,
    entity,
    entityId,
    assetType,
    `v${version}.${ext}`,
  ].join("/");

  // Generate public URL (CloudFront)
  const cdnBaseUrl = env.CDN_BASE_URL || "https://dfdx9u0psdezh.cloudfront.net";
  const publicUrl = `${cdnBaseUrl}/${key}`;

  return {
    key,
    version,
    publicUrl,
  };
};

// ==================== USER PROFILE KEYS ====================

export interface UserAvatarKeyOptions {
  userId: string;
  currentVersion?: number;
  filename: string;
}

/**
 * Generate S3 key for user avatar
 * Pattern: prod/public/users/{userId}/avatar/v{version}.{ext}
 */
export const generateUserAvatarKey = (
  options: UserAvatarKeyOptions
): GeneratedS3Key => {
  const { userId, currentVersion = 0, filename } = options;
  
  return generateS3Key({
    access: "public",
    entity: "users",
    entityId: userId,
    assetType: "avatar",
    version: currentVersion + 1,
    filename,
  });
};

export interface UserResumeKeyOptions {
  userId: string;
  currentVersion?: number;
  filename: string;
}

/**
 * Generate S3 key for user resume
 * Pattern: prod/private/users/{userId}/resume/v{version}.{ext}
 * 
 * Note: Resume is private - access via signed URLs only
 */
export const generateUserResumeKey = (
  options: UserResumeKeyOptions
): GeneratedS3Key => {
  const { userId, currentVersion = 0, filename } = options;
  
  return generateS3Key({
    access: "private",
    entity: "users",
    entityId: userId,
    assetType: "resume",
    version: currentVersion + 1,
    filename,
  });
};

// ==================== COURSE KEYS ====================

export interface CourseThumbnailKeyOptions {
  courseId: string;
  currentVersion?: number;
  filename: string;
}

/**
 * Generate S3 key for course thumbnail
 * Pattern: prod/public/courses/{courseId}/thumbnail/v{version}.{ext}
 */
export const generateCourseThumbnailKey = (
  options: CourseThumbnailKeyOptions
): GeneratedS3Key => {
  const { courseId, currentVersion = 0, filename } = options;
  
  return generateS3Key({
    access: "public",
    entity: "courses",
    entityId: courseId,
    assetType: "thumbnail",
    version: currentVersion + 1,
    filename,
  });
};

// ==================== LESSON VIDEO KEYS ====================

export interface LessonVideoKeyOptions {
  courseId: string;
  lessonId: string;
  lessonContentId: string;
  currentVersion?: number;
  filename: string;
}

/**
 * Generate S3 key for lesson video (raw upload)
 * Pattern: upload/courses/{courseId}/lessons/{lessonId}/contents/{contentId}/video/source-v{version}.{ext}
 * 
 * Note: Uses 'upload' environment for raw videos that will be processed
 */
export const generateLessonVideoKey = (
  options: LessonVideoKeyOptions
): GeneratedS3Key => {
  const { courseId, lessonId, lessonContentId, currentVersion = 0, filename } = options;
  const ext = getFileExtension(filename);
  
  const key = [
    "upload",
    "courses",
    courseId,
    "lessons",
    lessonId,
    "contents",
    lessonContentId,
    "video",
    `source-v${currentVersion + 1}.${ext}`,
  ].join("/");

  const cdnBaseUrl = env.CDN_BASE_URL || "https://dfdx9u0psdezh.cloudfront.net";
  
  return {
    key,
    version: currentVersion + 1,
    publicUrl: `${cdnBaseUrl}/${key}`,
  };
};

/**
 * Generate S3 key for processed HLS video
 * Pattern: prod/public/courses/{courseId}/lessons/{lessonId}/contents/{contentId}/hls/v{version}/
 */
export const generateLessonHLSKey = (
  options: Omit<LessonVideoKeyOptions, "filename">
): string => {
  const { courseId, lessonId, lessonContentId, currentVersion = 0 } = options;
  
  return [
    getS3Environment(),
    "public",
    "courses",
    courseId,
    "lessons",
    lessonId,
    "contents",
    lessonContentId,
    "hls",
    `v${currentVersion + 1}`,
  ].join("/");
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse S3 key to extract metadata
 */
export const parseS3Key = (key: string): {
  environment: string;
  access: string;
  entity: string;
  entityId: string;
  assetType: string;
  version: number;
  extension: string;
} | null => {
  const parts = key.split("/");
  
  // Minimum: env/access/entity/entityId/assetType/filename
  if (parts.length < 6) return null;
  
  const filename = parts[parts.length - 1];
  const versionMatch = filename.match(/v(\d+)\./);
  const version = versionMatch ? parseInt(versionMatch[1], 10) : 1;
  const extension = getFileExtension(filename);
  
  return {
    environment: parts[0],
    access: parts[1],
    entity: parts[2],
    entityId: parts[3],
    assetType: parts[4],
    version,
    extension,
  };
};

/**
 * Check if key is for a public asset
 */
export const isPublicKey = (key: string): boolean => {
  const parts = key.split("/");
  return parts.length >= 2 && parts[1] === "public";
};

/**
 * Get CDN URL for a key
 */
export const getCdnUrl = (key: string): string => {
  if (!key) return "";
  if (key.startsWith("http")) return key;
  
  const cdnBaseUrl = env.CDN_BASE_URL || "https://dfdx9u0psdezh.cloudfront.net";
  return `${cdnBaseUrl}/${key}`;
};

export default {
  generateS3Key,
  generateUserAvatarKey,
  generateUserResumeKey,
  generateCourseThumbnailKey,
  generateLessonVideoKey,
  generateLessonHLSKey,
  parseS3Key,
  isPublicKey,
  getCdnUrl,
};

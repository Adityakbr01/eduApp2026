import apiClient from "@/lib/api/axios";
import {
  ConfirmUploadPayload,
  ConfirmUploadResponse,
  ProfileData,
  ProfileImageUploadResponse,
  ProfileUpdatePayload,
  ResumeUploadResponse,
} from "./types";

// CloudFront/S3 public URL base
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || "https://dfdx9u0psdezh.cloudfront.net";

/**
 * Generate S3 public URL from key
 */
export const getProfileFileUrl = (key: string): string => {
  if (!key) return "";
  if (key.startsWith("http")) return key;
  return `${CDN_BASE_URL}/${key}`;
};

// ==================== PROFILE API ====================

export const profileApi = {
  /**
   * Get current user's profile
   * GET /auth/me/profile
   */
  getProfile: async (): Promise<ProfileData> => {
    const res = await apiClient.get("/auth/me/profile");
    return res.data.data;
  },

  /**
   * Update user's profile
   * PATCH /auth/me/profile
   */
  updateProfile: async (payload: ProfileUpdatePayload): Promise<ProfileData> => {
    const res = await apiClient.patch("/auth/me/profile", payload);
    return res.data.data;
  },

  /**
   * Get presigned URL for avatar upload
   * POST /upload/profile/presigned-url/avatar
   */
  getAvatarPresignedUrl: async (
    filename: string,
    size: number,
    mimeType: string
  ): Promise<ProfileImageUploadResponse> => {
    const res = await apiClient.post("/upload/profile/presigned-url/avatar", {
      filename,
      size,
      type: mimeType,
    });
    return res.data;
  },

  /**
   * Get presigned URL for resume upload
   * POST /upload/profile/presigned-url/resume
   */
  getResumePresignedUrl: async (
    filename: string,
    size: number,
    mimeType: string
  ): Promise<ResumeUploadResponse> => {
    const res = await apiClient.post("/upload/profile/presigned-url/resume", {
      filename,
      size,
      type: mimeType,
    });
    return res.data;
  },

  /**
   * Confirm file upload after S3 upload completes
   * POST /upload/profile/confirm
   */
  confirmUpload: async (
    payload: ConfirmUploadPayload
  ): Promise<ConfirmUploadResponse> => {
    const res = await apiClient.post("/upload/profile/confirm", payload);
    return res.data;
  },

  /**
   * Upload file to S3 using presigned URL
   * @param presignedUrl - The presigned URL from S3
   * @param file - The file to upload
   * @param options - Optional settings
   * @param options.onProgress - Progress callback
   * @param options.filename - If provided, sends Content-Disposition header (required for resume uploads)
   */
  uploadToS3: async (
    presignedUrl: string,
    file: File,
    options?: {
      onProgress?: (progress: number) => void;
      filename?: string;
    }
  ): Promise<void> => {
    const { onProgress, filename } = options || {};
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      
      // For resume uploads, server requires Content-Disposition header
      if (filename) {
        xhr.setRequestHeader("Content-Disposition", `attachment; filename="${filename}"`);
      }
      
      xhr.send(file);
    });
  },

  /**
   * Get signed URL to view resume
   * GET /upload/profile/resume/view
   */
  getResumeViewUrl: async (): Promise<{ url: string; key: string; version: number }> => {
    const res = await apiClient.get("/upload/profile/resume/view");
    return res.data.data;
  },

  /**
   * Delete resume
   * DELETE /upload/profile/resume
   */
  deleteResume: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete("/upload/profile/resume");
    return res.data;
  },
};

// ==================== MOCK API (for development) ====================

/**
 * Mock presigned URL generator for development
 * In production, this would come from the backend
 */
export const mockProfileApi = {
  getAvatarPresignedUrl: async (
    filename: string,
    _size: number,
    _mimeType: string
  ): Promise<ProfileImageUploadResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = `dev/public/users/mock-user-id/avatar/v${Date.now()}.${filename.split(".").pop()}`;
    
    return {
      success: true,
      message: "Presigned URL generated",
      data: {
        uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock`,
        key,
        publicUrl: getProfileFileUrl(key),
        version: 1,
      },
    };
  },

  getResumePresignedUrl: async (
    filename: string,
    _size: number,
    _mimeType: string
  ): Promise<ResumeUploadResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const key = `dev/private/users/mock-user-id/resume/v${Date.now()}.${filename.split(".").pop()}`;

    return {
      success: true,
      message: "Presigned URL generated",
      data: {
        uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock`,
        key,
        publicUrl: getProfileFileUrl(key),
        version: 1,
        filename,
      },
    };
  },

  /**
   * Mock upload to S3 - in a real scenario this uploads directly to S3
   * For mock, we'll just return the local file URL
   */
  uploadToPresignedUrl: async (
    _uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    // Simulate upload delay with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress?.(i);
    }
    
    // Return local blob URL for preview (in production, S3 URL would be used)
    return URL.createObjectURL(file);
  },

  confirmUpload: async (
    payload: ConfirmUploadPayload
  ): Promise<ConfirmUploadResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: `${payload.type} upload confirmed`,
      data: {
        url: getProfileFileUrl(payload.key),
        version: payload.version,
      },
    };
  },

  getResumeViewUrl: async (): Promise<{ url: string; key: string; version: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      url: "https://example.com/mock-resume.pdf",
      key: "dev/private/users/mock-user-id/resume/v1.pdf",
      version: 1,
    };
  },

  deleteResume: async (): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: "Resume deleted successfully",
    };
  },
};

export default profileApi;

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileApi, mockProfileApi, getProfileFileUrl } from "./api";
import {
  ProfileUpdatePayload,
  ProfileData,
  ConfirmUploadPayload,
} from "./types";
import { QUERY_KEYS } from "@/config/query-keys";
import { useAuthStore } from "@/store/auth";

// Flag to use mock API during development
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// ==================== PROFILE UPDATE MUTATION ====================

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload): Promise<ProfileData> => {
      if (USE_MOCK_API) {
        // Mock update - simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          id: user?.id || "mock-id",
          name: payload.firstName && payload.lastName 
            ? `${payload.firstName} ${payload.lastName}` 
            : user?.name || "",
          email: user?.email || "",
          phone: user?.phone,
          profile: {
            ...payload,
          },
        } as ProfileData;
      }
      return profileApi.updateProfile(payload);
    },
    onSuccess: (data) => {
      // Update local auth store with new name if changed
      if (data && user) {
        setUser({
          ...user,
          name: data.name || user.name,
        });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS.DETAIL(user?.id || "")] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

// ==================== AVATAR UPLOAD MUTATION ====================

interface AvatarUploadResult {
  url: string;
  key: string;
  version: number;
}

export const useUploadAvatar = () => {
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: async (file: File): Promise<AvatarUploadResult> => {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Image must be less than 5MB");
      }

      if (USE_MOCK_API) {
        // Mock upload flow
        const presignedResponse = await mockProfileApi.getAvatarPresignedUrl(
          file.name,
          file.size,
          file.type
        );

        // Mock S3 upload with progress
        const localUrl = await mockProfileApi.uploadToPresignedUrl(
          presignedResponse.data.uploadUrl,
          file
        );

        // Confirm upload
        await mockProfileApi.confirmUpload({
          key: presignedResponse.data.key,
          type: "avatar",
          version: presignedResponse.data.version,
        });

        return {
          url: localUrl,
          key: presignedResponse.data.key,
          version: presignedResponse.data.version,
        };
      }

      // Real API flow
      const presignedResponse = await profileApi.getAvatarPresignedUrl(
        file.name,
        file.size,
        file.type
      );

      // Upload to S3 using presigned URL
      await profileApi.uploadToS3(presignedResponse.data.uploadUrl, file);

      // Confirm upload with backend
      const confirmResult = await profileApi.confirmUpload({
        key: presignedResponse.data.key,
        type: "avatar",
        version: presignedResponse.data.version,
      });

      return {
        url: confirmResult.data.url,
        key: presignedResponse.data.key,
        version: confirmResult.data.version,
      };
    },
    onSuccess: (data) => {
      toast.success("Profile picture updated!");
      // Update local avatar in auth store
      if (user) {
        setUser({
          ...user,
          avatar: data.url,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
};

// ==================== RESUME UPLOAD MUTATION ====================

interface ResumeUploadResult {
  url: string;
  key: string;
  filename: string;
  version: number;
}

export const useUploadResume = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<ResumeUploadResult> => {
      // Validate file
      if (file.type !== "application/pdf") {
        throw new Error("Please upload a PDF file");
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("Resume must be less than 10MB");
      }

      if (USE_MOCK_API) {
        // Mock upload flow
        const presignedResponse = await mockProfileApi.getResumePresignedUrl(
          file.name,
          file.size,
          file.type
        );

        // Mock S3 upload
        const localUrl = await mockProfileApi.uploadToPresignedUrl(
          presignedResponse.data.uploadUrl,
          file
        );

        // Confirm upload
        await mockProfileApi.confirmUpload({
          key: presignedResponse.data.key,
          type: "resume",
          version: presignedResponse.data.version,
          filename: file.name,
        });

        return {
          url: localUrl,
          key: presignedResponse.data.key,
          filename: file.name,
          version: presignedResponse.data.version,
        };
      }

      // Real API flow
      const presignedResponse = await profileApi.getResumePresignedUrl(
        file.name,
        file.size,
        file.type
      );

      // Upload to S3 using presigned URL
      await profileApi.uploadToS3(presignedResponse.data.uploadUrl, file);

      // Confirm upload with backend
      const confirmResult = await profileApi.confirmUpload({
        key: presignedResponse.data.key,
        type: "resume",
        version: presignedResponse.data.version,
        filename: file.name,
      });

      return {
        url: confirmResult.data.url,
        key: presignedResponse.data.key,
        filename: file.name,
        version: confirmResult.data.version,
      };
    },
    onSuccess: () => {
      toast.success("Resume uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload resume");
    },
  });
};

// ==================== DELETE RESUME MUTATION ====================

export const useDeleteResume = () => {
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK_API) {
        return mockProfileApi.deleteResume();
      }
      return profileApi.deleteResume();
    },
    onSuccess: () => {
      toast.success("Resume deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete resume");
    },
  });
};

// ==================== GET RESUME VIEW URL ====================

export const useGetResumeViewUrl = () => {
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK_API) {
        return mockProfileApi.getResumeViewUrl();
      }
      return profileApi.getResumeViewUrl();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to get resume URL");
    },
  });
};

// ==================== CONFIRM UPLOAD MUTATION ====================

export const useConfirmUpload = () => {
  return useMutation({
    mutationFn: async (payload: ConfirmUploadPayload) => {
      if (USE_MOCK_API) {
        return mockProfileApi.confirmUpload(payload);
      }
      return profileApi.confirmUpload(payload);
    },
  });
};

// Export utility function
export { getProfileFileUrl };

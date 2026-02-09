import UserModel from "src/models/user/user.model.js";
import { ProfessionEnum, type UserProfile } from "src/types/user.model.type.js";
import { getCdnUrl } from "src/utils/s3KeyGenerator.js";
import logger from "src/utils/logger.js";
import userCache from "src/cache/userCache.js";

export interface UpdateProfilePayload {
  // Personal Info
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO date string
  bio?: string;
  
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Professional
  profession?: ProfessionEnum;
  organization?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    bio?: string;
    avatarUrl?: string;
    avatarVersion?: number;
    city?: string;
    state?: string;
    country?: string;
    profession?: string;
    organization?: string;
    resumeUrl?: string;
    resumeVersion?: number;
    linkedinUrl?: string;
    githubUrl?: string;
  };
}

class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await UserModel.findById(userId)
      .select("name email phone profile")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    const profile = user.profile || {};

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth?.toISOString().split("T")[0],
        bio: profile.bio,
        avatarUrl: profile.avatar?.key ? getCdnUrl(profile.avatar.key) : undefined,
        avatarVersion: profile.avatar?.version,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        profession: profile.profession,
        organization: profile.organization,
        resumeUrl: profile.resume?.key ? getCdnUrl(profile.resume.key) : undefined,
        resumeVersion: profile.resume?.version,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
      },
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    payload: UpdateProfilePayload
  ): Promise<ProfileResponse> {
    // Build update object
    const updateFields: Record<string, any> = {};

    // Map payload fields to profile fields
    const profileFieldMap: Record<string, string> = {
      firstName: "profile.firstName",
      lastName: "profile.lastName",
      dateOfBirth: "profile.dateOfBirth",
      bio: "profile.bio",
      city: "profile.city",
      state: "profile.state",
      country: "profile.country",
      profession: "profile.profession",
      organization: "profile.organization",
      linkedinUrl: "profile.linkedinUrl",
      githubUrl: "profile.githubUrl",
    };

    // Build update fields
    logger.info(`Profile update payload: ${JSON.stringify(payload, null, 2)}`);
    
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== "" && profileFieldMap[key]) {
        // Special handling for dateOfBirth
        if (key === "dateOfBirth") {
          const dateValue = new Date(value as string);
          // Only set if valid date
          if (!isNaN(dateValue.getTime())) {
            updateFields[profileFieldMap[key]] = dateValue;
            logger.debug(`Setting dateOfBirth to: ${dateValue.toISOString()}`);
          } else {
            logger.warn(`Invalid dateOfBirth value received: ${value}`);
          }
        } else {
          updateFields[profileFieldMap[key]] = value;
        }
      }
    }
    
    logger.info(`Profile update fields: ${JSON.stringify(updateFields, null, 2)}`);

    // Also update the main name field if firstName/lastName provided
    if (payload.firstName || payload.lastName) {
      const currentUser = await UserModel.findById(userId).select("profile").lean();
      const firstName = payload.firstName || currentUser?.profile?.firstName || "";
      const lastName = payload.lastName || currentUser?.profile?.lastName || "";
      if (firstName || lastName) {
        updateFields.name = `${firstName} ${lastName}`.trim();
      }
    }

    // Validate URLs if provided
    if (payload.linkedinUrl && !this.isValidUrl(payload.linkedinUrl)) {
      throw new Error("Invalid LinkedIn URL format");
    }
    if (payload.githubUrl && !this.isValidUrl(payload.githubUrl)) {
      throw new Error("Invalid GitHub URL format");
    }

    // Validate profession enum
    if (payload.profession && !Object.values(ProfessionEnum).includes(payload.profession)) {
      throw new Error("Invalid profession value");
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("name email phone profile");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Invalidate user profile cache so next /auth/me fetches fresh data
    await userCache.deleteUserProfile(userId);
    logger.debug(`Invalidated user profile cache for user: ${userId}`);

    return this.getProfile(userId);
  }

  /**
   * Delete user resume
   */
  async deleteResume(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await UserModel.findById(userId).select("profile.resume").lean();
    
    if (!user?.profile?.resume?.key) {
      throw new Error("No resume found to delete");
    }

    await UserModel.findByIdAndUpdate(userId, {
      $unset: { "profile.resume": 1 },
    });

    return {
      success: true,
      message: "Resume deleted successfully",
    };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;

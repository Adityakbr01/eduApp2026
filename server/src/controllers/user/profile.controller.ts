import type { Request, Response } from "express";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import profileService, { type UpdateProfilePayload } from "src/services/user/profile.service.js";
import logger from "src/utils/logger.js";

export const profileController = {
  /**
   * Get current user's profile
   * GET /auth/me/profile
   */
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    logger.info(`Getting profile for user: ${userId}`);

    const profile = await profileService.getProfile(userId);

    sendResponse(res, 200, "Profile fetched successfully", profile);
  }),

  /**
   * Update current user's profile
   * PATCH /auth/me/profile
   */
  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const payload: UpdateProfilePayload = req.body;

    logger.info(`Updating profile for user: ${userId}`);
    logger.debug(`Profile update request body: ${JSON.stringify(payload)}`);

    // Validate payload is not empty
    if (!payload || Object.keys(payload).length === 0) {
      logger.warn(`Empty profile update payload from user: ${userId}`);
      return sendResponse(res, 400, "No update data provided");
    }

    const updatedProfile = await profileService.updateProfile(userId, payload);

    logger.info(`Profile updated successfully for user: ${userId}`);
    sendResponse(res, 200, "Profile updated successfully", updatedProfile);
  }),

  /**
   * Delete current user's resume
   * DELETE /auth/me/resume
   */
  deleteResume: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await profileService.deleteResume(userId);

    sendResponse(res, 200, result.message, result);
  }),
};

export default profileController;

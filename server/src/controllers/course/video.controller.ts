import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import { getVideoOTP } from "src/services/upload/vdocipher.service.js";
import logger from "src/utils/logger.js";
import { sessionService } from "src/services/auth/session.service.js";

export const playVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // LessonContent ID

    const session = await sessionService.getCurrentUserService(req);

    // 1. Find the content
    const content = await LessonContent.findById(id);

    if (!content) {
        return sendResponse(res, 404, "Content not found");
    }

    if (content.type !== "video" || !content.video?.videoId) {
        return sendResponse(res, 400, "Content is not a processed video");
    }

    // 2. Get OTP from VdoCipher
    try {
        const otpData = await getVideoOTP(content.video.videoId, session?.user.email);

        logger.info("✅ OTP generated for video playback", {
            contentId: id,
            videoId: content.video.videoId
        });

        return sendResponse(res, 200, "OTP generated successfully", otpData);
    } catch (error) {
        logger.error("❌ Failed to generate OTP", { error });
        return sendResponse(res, 500, "Failed to generate video credentials");
    }
});

import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import { liveStreamService } from "src/services/liveStream/liveStream.service.js";
import sessionCache from "src/cache/userCache.js";
import logger from "src/utils/logger.js";
import { getViewerCount } from "src/utils/liveViewerCounter.js";

// ==================== INSTRUCTOR CONTROLLERS ====================

/**
 * POST /api/v1/live-streams
 * Instructor creates a live session
 */
export const createLiveSession = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;
        const {
            courseId,
            lessonId,
            recordingTitle,
            recordingDescription,
            scheduledAt,
            autoSaveRecording,
            liveId,
            serverUrl,
            streamKey,
            chatSecret,
            chatEmbedCode,
            playerEmbedCode
        } = req.body;

        console.log(req.body);

        const result = await liveStreamService.createLiveSession(instructorId, {
            courseId,
            lessonId,
            recordingTitle,
            recordingDescription,
            scheduledAt,
            autoSaveRecording,
            liveId,
            serverUrl,
            streamKey,
            chatSecret,
            chatEmbedCode,
            playerEmbedCode
        });

        logger.info("✅ Live session created by instructor", {
            instructorId,
            liveId: result.liveId,
        });

        return sendResponse(res, 201, "Live session created successfully", result);
    }
);

/**
 * GET /api/v1/live-streams/instructor
 * Instructor fetches own live streams
 */
export const getInstructorStreams = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;
        const courseId = req.query.courseId as string | undefined;

        const streams = await liveStreamService.getInstructorStreams(instructorId, courseId);

        return sendResponse(res, 200, "Instructor streams fetched", streams);
    }
);

/**
 * GET /api/v1/live-streams/instructor/:id/credentials
 * Instructor re-fetches RTMP credentials
 */
export const getStreamCredentials = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;
        const streamId = req.params.id;

        const credentials = await liveStreamService.getStreamRTMPCredentials(instructorId, streamId);

        return sendResponse(res, 200, "Stream credentials fetched", credentials);
    }
);

/**
 * PATCH /api/v1/live-streams/instructor/:id/status
 * Instructor manually changes the stream status
 */
export const updateStreamStatus = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const instructorId = req.user!.id;
        const streamId = req.params.id;
        const { status } = req.body;

        const result = await liveStreamService.updateStreamStatus(instructorId, streamId, status);

        logger.info(`✅ Stream status manually updated to ${status}`, {
            streamId,
            instructorId,
        });

        return sendResponse(res, 200, "Stream status updated", result);
    }
);

// ==================== ADMIN CONTROLLERS ====================

/**
 * PATCH /api/v1/live-streams/courses/:courseId/enable
 * Admin enables live streaming for a course
 */
export const enableLiveStreaming = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { courseId } = req.params;

        const result = await liveStreamService.enableLiveStreamingForCourse(courseId);

        logger.info("✅ Admin enabled live streaming", { courseId, adminId: req.user!.id });

        return sendResponse(res, 200, "Live streaming enabled for course", result);
    }
);

/**
 * PATCH /api/v1/live-streams/courses/:courseId/disable
 * Admin disables live streaming for a course
 */
export const disableLiveStreaming = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { courseId } = req.params;

        const result = await liveStreamService.disableLiveStreamingForCourse(courseId);

        logger.info("✅ Admin disabled live streaming", { courseId, adminId: req.user!.id });

        return sendResponse(res, 200, "Live streaming disabled for course", result);
    }
);

// ==================== STUDENT CONTROLLERS ====================

/**
 * GET /api/v1/live-streams/student/course/:courseId
 * Student views currently live stream for a course
 */
export const getStudentLiveStream = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const studentId = req.user!.id;
        const { courseId } = req.params;

        // Lightweight Redis cache lookup instead of full getCurrentUserService
        // (which fetches profile, permissions, enrolled courses, avatar — all unneeded here)
        const cachedProfile = await sessionCache.getUserProfile(studentId);
        const email = cachedProfile?.email || "";
        const name = cachedProfile?.name || "Student";

        const result = await liveStreamService.getStudentLiveStream(studentId, courseId, email, name);

        // Attach viewer count from Redis
        const viewerCount = await getViewerCount(result.liveId);

        return sendResponse(res, 200, "Live stream fetched", {
            ...result,
            viewerCount,
        });
    }
);

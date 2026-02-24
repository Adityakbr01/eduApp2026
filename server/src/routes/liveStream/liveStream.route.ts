import express from "express";
import { PERMISSIONS } from "src/constants/permissions.js";
import {
    createLiveSession,
    disableLiveStreaming,
    enableLiveStreaming,
    getInstructorStreams,
    getStreamCredentials,
    getStudentLiveStream,
    updateStreamStatus,
} from "src/controllers/liveStream/liveStream.controller.js";
import {
    getLiveStreamAccessStatus,
    listAccessRequests,
    processAccessRequest,
    requestLiveStreamAccess,
} from "src/controllers/liveStream/liveStreamAccess.controller.js";
import isInstructorOfCourse from "src/middlewares/custom/isInstructorOfCourse.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkPermission from "src/middlewares/system/checkPermission.js";

const router = express.Router();

// ==================== ACCESS REQUEST ROUTES ====================

// Instructor applies for VdoCipher dashboard access
router.post(
    "/access-request",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    requestLiveStreamAccess
);

router.get(
    "/access-request/status",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    getLiveStreamAccessStatus
);

// Admin manages access requests
router.get(
    "/admin/access-requests",
    authMiddleware,
    checkPermission(PERMISSIONS.MANAGE_LIVE_STREAM.code),
    listAccessRequests
);

router.patch(
    "/admin/access-requests/:id",
    authMiddleware,
    checkPermission(PERMISSIONS.MANAGE_LIVE_STREAM.code),
    processAccessRequest
);

// ==================== INSTRUCTOR ROUTES ====================

// Create a live session (instructor only, must own the course)
router.post(
    "/",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    isInstructorOfCourse,
    createLiveSession
);

// Get instructor's live streams (optional ?courseId=xxx)
router.get(
    "/instructor",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    getInstructorStreams
);

// Re-fetch RTMP credentials for a stream
router.get(
    "/instructor/:id/credentials",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    getStreamCredentials
);

// Update stream status (go live, end stream)
router.patch(
    "/instructor/:id/status",
    authMiddleware,
    checkPermission(PERMISSIONS.START_LIVE_STREAM.code),
    updateStreamStatus
);

// ==================== ADMIN ROUTES ====================

// Enable live streaming for a course
router.patch(
    "/courses/:courseId/enable",
    authMiddleware,
    checkPermission(PERMISSIONS.MANAGE_LIVE_STREAM.code),
    enableLiveStreaming
);

// Disable live streaming for a course
router.patch(
    "/courses/:courseId/disable",
    authMiddleware,
    checkPermission(PERMISSIONS.MANAGE_LIVE_STREAM.code),
    disableLiveStreaming
);

// ==================== STUDENT ROUTES ====================

// Get current live stream for a course (enrollment verified in service)
router.get(
    "/student/course/:courseId",
    authMiddleware,
    checkPermission(PERMISSIONS.VIEW_LIVE_STREAM.code),
    getStudentLiveStream
);

export default router;

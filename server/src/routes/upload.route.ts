import express from "express";

import {
    uploadCourseImage,
    uploadLessonVideo,
    uploadLessonDocument,
    uploadLessonAudio,
    uploadLessonContent,
} from "../utils/upload.js";
import { uploadController } from "src/controllers/upload.controller.js";
import { ROLES } from "src/constants/roles.js";
import { PERMISSIONS } from "src/constants/permissions.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkPermission from "src/middlewares/system/checkPermission.js";
import checkRole from "src/middlewares/system/checkRole.js";

const router = express.Router();

// All upload routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/v1/upload/course-image
 * @desc    Upload course cover image
 * @access  Private - Instructor, Admin
 */
router.post(
    "/course-image",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    checkPermission(PERMISSIONS.WRITE_COURSE.code),
    uploadCourseImage.single("image"),
    uploadController.uploadCourseImage
);

/**
 * @route   POST /api/v1/upload/lesson-video
 * @desc    Upload lesson video
 * @access  Private - Instructor, Admin
 */
router.post(
    "/lesson-video",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    checkPermission(PERMISSIONS.UPDATE_COURSE.code),
    uploadLessonVideo.single("video"),
    uploadController.uploadLessonVideo
);

/**
 * @route   POST /api/v1/upload/lesson-document
 * @desc    Upload lesson document (PDF)
 * @access  Private - Instructor, Admin
 */
router.post(
    "/lesson-document",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    checkPermission(PERMISSIONS.UPDATE_COURSE.code),
    uploadLessonDocument.single("document"),
    uploadController.uploadLessonDocument
);

/**
 * @route   POST /api/v1/upload/lesson-audio
 * @desc    Upload lesson audio
 * @access  Private - Instructor, Admin
 */
router.post(
    "/lesson-audio",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    checkPermission(PERMISSIONS.UPDATE_COURSE.code),
    uploadLessonAudio.single("audio"),
    uploadController.uploadLessonAudio
);

/**
 * @route   POST /api/v1/upload/lesson-content
 * @desc    Upload any lesson content (auto-detect)
 * @access  Private - Instructor, Admin
 */
router.post(
    "/lesson-content",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    checkPermission(PERMISSIONS.UPDATE_COURSE.code),
    uploadLessonContent.single("file"),
    uploadController.uploadLessonContent
);

/**
 * @route   DELETE /api/v1/upload/:publicId
 * @desc    Delete uploaded file
 * @access  Private - Instructor, Admin
 */
router.delete(
    "/:publicId",
    checkRole(ROLES.INSTRUCTOR.code, ROLES.ADMIN.code),
    uploadController.deleteUpload
);

export default router;

import express from "express";

import { uploadController } from "src/controllers/upload.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import { uploadRateLimiter } from "src/middlewares/system/rateLimit.middleware.js";

const router = express.Router();

// All upload routes require authentication
router.use(authMiddleware);

// ==================== PROFILE UPLOADS ====================

// Avatar Upload (with rate limiting)
router.post(
  "/profile/presigned-url/avatar",
  uploadRateLimiter,
  uploadController.getAvatarPresignedUrl
);

// Resume Upload (with rate limiting)
router.post(
  "/profile/presigned-url/resume",
  uploadRateLimiter,
  uploadController.getResumePresignedUrl
);

// Confirm Profile Upload (avatar or resume) - with rate limiting
router.post(
  "/profile/confirm",
  uploadRateLimiter,
  uploadController.confirmProfileUpload
);

// Get Resume View URL (signed URL for private resume) - no rate limit needed
router.get(
  "/profile/resume/view",
  uploadController.getResumeViewUrl
);

// Delete Resume - with rate limiting
router.delete(
  "/profile/resume",
  uploadRateLimiter,
  uploadController.deleteResume
);

// ==================== COURSE UPLOADS ====================

// Course Image Upload //Tested
router.post(
  "/course/presigned-url/image",
    uploadController.getCourseImagePresignedUrl
);


// Lesson Video Upload
router.post(
  "/course/lesson/presigned-url/video",
  uploadController.getLessonVideoPresignedUrl
);

// Multipart Upload for Large Files
router.post("/multipart/init", uploadController.initMultipart);
router.post("/multipart/sign-part", uploadController.signPart);
router.post("/multipart/complete", uploadController.completeMultipart);

export default router;




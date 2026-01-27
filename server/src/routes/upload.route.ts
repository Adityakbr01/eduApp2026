import express from "express";

import { uploadController } from "src/controllers/upload.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";

const router = express.Router();

// All upload routes require authentication
router.use(authMiddleware);



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




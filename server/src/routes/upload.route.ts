import express from "express";

import { uploadController } from "src/controllers/upload.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";

const router = express.Router();

// All upload routes require authentication
router.use(authMiddleware);
router.post("/presigned-url", uploadController.getPresignedUrl);
router.post("/multipart/init", uploadController.initMultipart);
router.post("/multipart/sign-part", uploadController.signPart);
router.post("/multipart/complete", uploadController.completeMultipart);

export default router;




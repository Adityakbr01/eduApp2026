import express from "express";
import { playVideo } from "src/controllers/course/video.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";

const router = express.Router();

// Get OTP for video playback
// isEnrolled middleware is needed for video playback || todo
router.get("/:id/play", authMiddleware, playVideo);

export default router;
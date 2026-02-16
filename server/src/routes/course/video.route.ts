import express from "express";
import { playVideo } from "src/controllers/course/video.controller.js";
import isEnrolled from "src/middlewares/custom/isEnrolled.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";

const router = express.Router();

// Get OTP for video playback
router.get("/:id/play", authMiddleware, playVideo);

export default router;
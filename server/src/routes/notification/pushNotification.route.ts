import express from "express";
import { ROLES } from "src/constants/roles.js";
import pushNotificationController from "src/controllers/notification/pushNotification.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const router = express.Router();

// Require authentication for all notification routes
router.use(authMiddleware);

/**
 * @route   POST /api/v1/notifications/push/register
 * @desc    Register a device for push notifications
 * @access  Private (Authenticated Users)
 */
router.post("/register", pushNotificationController.registerDeviceToken);

// Below routes require ADMIN or MANAGER role
router.use(checkRole(ROLES.ADMIN.code, ROLES.MANAGER.code));

/**
 * @route   POST /api/v1/notifications/push/send
 * @desc    Send an immediate push notification
 * @access  Private (Admin/Manager)
 */
router.post("/send", pushNotificationController.sendPushNotification);

/**
 * @route   POST /api/v1/notifications/push/send-all
 * @desc    Send an immediate push notification to all users
 * @access  Private (Admin/Manager)
 */
router.post("/send-all", pushNotificationController.sendToAllPushNotification);

/**
 * @route   POST /api/v1/notifications/push/schedule
 * @desc    Schedule a push notification
 * @access  Private (Admin/Manager)
 */
router.post("/schedule", pushNotificationController.schedulePushNotification);

export default router;

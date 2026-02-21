import resolveUserIdOrEmail from "src/helpers/resolveUserIdOrEmail.js";
import pushNotificationService from "src/services/Notification/pushNotification.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";



/**
 * @route   POST /api/v1/notifications/push/register
 * @desc    Register a device for push notifications
 * @access  Private (Authenticated Users)
 */
export const registerDeviceToken = catchAsync(async (req, res) => {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const { token, platform } = req.body;

    await pushNotificationService.registerDevice({
        userId: userId.toString(),
        token,
        platform: platform || "unknown"
    });

    sendResponse(res, 200, "Device token registered successfully", null);
});

/**
 * @route   POST /api/v1/notifications/push/send
 * @desc    Send an immediate push notification
 * @access  Private (Admin/System)
 */
export const sendPushNotification = catchAsync(async (req, res) => {
    const { userId, title, body, data } = req.body;

    const resolvedUserId = await resolveUserIdOrEmail(userId);

    await pushNotificationService.sendPushNotification({
        userId: resolvedUserId,
        title,
        body,
        data
    });

    sendResponse(res, 200, "Push notification queued successfully", null);
});

/**
 * @route   POST /api/v1/notifications/push/send-all
 * @desc    Send an immediate push notification to all users (optional platform filter)
 * @access  Private (Admin/Manager)
 */
export const sendToAllPushNotification = catchAsync(async (req, res) => {
    const { title, body, targetPlatforms, data } = req.body;

    await pushNotificationService.sendToAllPushNotification({
        title,
        body,
        targetPlatforms, // e.g., ["web", "android"]
        data
    });

    sendResponse(res, 200, "Send-to-All push notification queued successfully", null);
});

/**
 * @route   POST /api/v1/notifications/push/schedule
 * @desc    Schedule a push notification (one-time or recurring, targeted or all users)
 * @access  Private (Admin/System)
 */
export const schedulePushNotification = catchAsync(async (req, res) => {
    const { userId, title, body, data, delayMs, cron, isSendToAll, targetPlatforms } = req.body;

    const resolvedUserId = await resolveUserIdOrEmail(userId);

    await pushNotificationService.schedulePushNotification({
        userId: resolvedUserId,
        title,
        body,
        data,
        delayMs,
        cron,
        isSendToAll,
        targetPlatforms
    });

    sendResponse(res, 200, "Push notification scheduled successfully", null);
});

export default {
    registerDeviceToken,
    sendPushNotification,
    sendToAllPushNotification,
    schedulePushNotification
};

import { type Request, type Response } from "express";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import { NotificationService } from "src/services/Notification/notification.service.js";
import AppError from "src/utils/AppError.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// GET /notifications (Student)
export const getNotifications = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore - User is attached by middleware
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    const { cursor, limit } = req.query;

    const result = await NotificationService.getUserNotifications(
        userId.toString(),
        cursor as string,
        limit ? parseInt(limit as string) : 20
    );

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.FETCHED, result);
});

// GET /notifications/unread-count
export const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    const count = await NotificationService.getUnreadCount(userId.toString());

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.FETCHED, { count });
});

// PATCH /notifications/read-all
export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    await NotificationService.markAllAsRead(userId.toString());

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.UPDATED, { message: "All notifications marked as read" });
});

// PATCH /notifications/:id/read
export const markAsRead = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    const { id } = req.params;

    await NotificationService.markAsRead(userId.toString(), [id]);

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.UPDATED, { message: "Notification marked as read" });
});

// ------------------------------------------
// INSTRUCTOR ENDPOINTS
// ------------------------------------------

// POST /notifications/instructor/send
export const sendNotification = catchAsync(async (req: Request, res: Response) => {
    const { courseId, title, message, level, category, link } = req.body;

    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    await NotificationService.sendNotification({
        courseId,
        title,
        message,
        level: level || "LOW",
        category: category || "INFO",
        link,
        createdBy: userId,
        type: "ANNOUNCEMENT"
    });

    sendResponse(res, STATUSCODE.CREATED, SUCCESS_CODE.CREATED, { message: "Notification Queued" });
});

// GET /notifications/instructor/sent
export const getSentNotifications = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", STATUSCODE.UNAUTHORIZED, ERROR_CODE.UNAUTHORIZED);

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const result = await NotificationService.getSentNotifications(userId.toString(), Number(limit), skip);

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.FETCHED, result);
});

// PATCH /notifications/instructor/:id
export const updateNotification = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const { id } = req.params;

    // Check ownership or permissions if needed

    const updated = await NotificationService.updateNotification(id, req.body);

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.UPDATED, updated);
});

// DELETE /notifications/instructor/:id
export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const { id } = req.params;

    await NotificationService.deleteNotification(id);

    sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.DELETED, { message: "Notification deleted" });
});

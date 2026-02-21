import express from "express";
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead
} from "src/controllers/notification/notification.controller.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;

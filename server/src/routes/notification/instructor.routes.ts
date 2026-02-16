import express from "express";
import {
    sendNotification,
    updateNotification,
    deleteNotification,
    getSentNotifications
} from "src/controllers/notification.controller.js";
// You might want to add checkRole(ROLES.INSTRUCTOR) here
// import checkRole from "src/middlewares/system/checkRole.js";
// import { ROLES } from "src/constants/roles.js";

const router = express.Router();

// Ensure these are protected by Auth Middleware (parent router handles it)
// router.use(checkRole(ROLES.INSTRUCTOR.code)); 

router.post("/send", sendNotification);
router.get("/sent", getSentNotifications);
router.patch("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;

import { Worker, type Job } from "bullmq";
import { env } from "src/configs/env.js";
import { bullMQConnection, redis } from "src/configs/redis.js";
import { NotificationModel } from "src/models/Notification/notification.model.js";
import UserModel from "src/models/user/user.model.js";
import { UserNotificationModel } from "src/models/user/userNotification.model.js";
import logger from "src/utils/logger.js";
import { getIO } from "../../Socket/socket.js";
import emailQueue from "../queues/email.queue.js";
import { NOTIFICATION_QUEUE_NAME } from "../queues/notification.queue.js";

// Define Payload Interface
export interface NotificationJobPayload {
    notificationId: string;
    courseId?: string;
}

export const notificationWorker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job: Job<NotificationJobPayload>) => {
        logger.info(`[NotificationWorker] Processing job: ${job.name}`);

        if (job.name !== "notification:send") return;

        try {
            const { notificationId, courseId } = job.data;

            // 1. Fetch Notification
            const notification = await NotificationModel.findById(notificationId);
            if (!notification) {
                logger.error(`Notification ${notificationId} not found`);
                return;
            }

            // 2. Fan-out to Users
            const query: any = {};
            // If courseId is provided, you might want to filter by validation logic
            // providing a real implementation for 'All Students' or 'Course Students'

            // For now, fetching all users for demonstration as per original logic
            const users = await UserModel.find(query).select("_id email");

            const userNotifications = users.map(user => ({
                userId: user._id,
                notificationId: notification._id,
                isRead: false
            }));

            if (userNotifications.length > 0) {
                await UserNotificationModel.insertMany(userNotifications);
            }

            // 3. Socket.io & Redis Updates
            const io = getIO();

            // Pipeline Redis increments
            const pipeline = redis.pipeline();

            userNotifications.forEach(un => {
                pipeline.incr(`user:unread:${un.userId}`);

                // Real-time Emit
                io.to(`user:${un.userId}`).emit("notification:new", notification);
            });

            await pipeline.exec();

            // 4. Smart Alert (Email Fallback)
            if (["HIGH", "CRITICAL"].includes(notification.level)) {
                for (const user of users) {
                    const isOnline = await redis.get(`online:${user._id}`);
                    if (!isOnline && user.email) {
                        await emailQueue.add("send-email", {
                            to: user.email,
                            subject: `Important Alert: ${notification.title}`,
                            context: {
                                title: notification.title,
                                message: notification.message,
                                link: notification.link || "#",
                                name: "Student" // or user.name if available
                            }
                        });
                    }
                }
            }

            logger.info(`✅ Notification processed: ${notification.title} -> ${users.length} users`);

        } catch (error) {
            logger.error("❌ Notification Worker Failed:", error);
            throw error;
        }
    },
    {
        connection: bullMQConnection,
        concurrency: env.BULLMQ_WORKER_CONCURRENCY || 5,
    }
);

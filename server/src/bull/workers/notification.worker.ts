import { Worker, type Job } from "bullmq";
import { env } from "src/configs/env.js";
import { bullMQConnection, redis } from "src/configs/redis.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ROLES } from "src/constants/roles.js";
import { NotificationModel } from "src/models/Notification/notification.model.js";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import { RoleModel } from "src/models/permission/role.model.js";
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
        logger.info(`[NotificationWorker] Processing job: ${job.name} (ID: ${job.id})`);

        if (job.name !== "notification:send") return;

        try {
            const { notificationId, courseId } = job.data;

            // 1. Fetch Notification
            const notification = await NotificationModel.findById(notificationId).lean();
            if (!notification) {
                logger.error(`❌ Notification ${notificationId} not found`);
                return;
            }

            // 2. Identify Target Users
            let users: { _id: any; email?: string }[] = [];

            if (courseId) {
                // Scenario 1: Only send to users ACTIVE enrollment in courseId
                logger.debug(`[NotificationWorker] Target: Enrolled users in course ${courseId}`);

                const activeEnrollments = await Enrollment.find({
                    courseId,
                    status: EnrollmentStatus.ACTIVE
                }).select("userId").lean();

                const userIds = activeEnrollments.map(e => e.userId);

                if (userIds.length > 0) {
                    users = await UserModel.find({
                        _id: { $in: userIds },
                        isBanned: false
                    }).select("_id email").lean();
                }
            } else {
                // Scenario 2: Only send to users with role "STUDENT"
                logger.debug("[NotificationWorker] Target: All students");

                const studentRole = await RoleModel.findOne({ name: ROLES.STUDENT.code })
                    .select("_id")
                    .lean();

                if (studentRole) {
                    users = await UserModel.find({
                        roleId: studentRole._id,
                        isBanned: false
                    }).select("_id email").lean();
                }
            }

            // Safety check: Prevent massive accidental broadcast if users array is empty
            if (users.length === 0) {
                logger.warn(`[NotificationWorker] ⚠️ No target users found for notification ${notificationId}`);
                return;
            }

            // 3. Batch Create UserNotification records
            const userNotifications = users.map(user => ({
                userId: user._id,
                notificationId: notification._id,
                isRead: false
            }));

            // Use larger batch size for insertMany if needed, for now standard insertMany is fine
            await UserNotificationModel.insertMany(userNotifications);

            // 4. Real-time Dispatch (Socket.io & Redis)
            const io = getIO();
            const pipeline = redis.pipeline();

            users.forEach(user => {
                // Increment unread count in Redis
                pipeline.incr(`user:unread:${user._id}`);

                // Real-time Emit via Socket.io
                io.to(`user:${user._id}`).emit("notification:new", notification);
            });

            await pipeline.exec();

            // 5. Email Fallback for High Priority
            if (["HIGH", "CRITICAL"].includes(notification.level)) {
                logger.debug(`[NotificationWorker] Sending priority emails to ${users.length} users`);

                // Add email jobs to the queue
                const emailJobs = users
                    .filter(u => u.email)
                    .map(u => ({
                        name: EMAIL_JOB_NAMES.NOTIFICATION_EMAIL,
                        data: {
                            to: u.email!,
                            subject: `Important Alert: ${notification.title}`,
                            context: {
                                title: notification.title,
                                message: notification.message,
                                link: notification.link || "#",
                                name: "Learner"
                            }
                        }
                    }));

                if (emailJobs.length > 0) {
                    await emailQueue.addBulk(emailJobs);
                }
            }

            logger.info(`✅ Notification processed: "${notification.title}" -> ${users.length} users targeted`);

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

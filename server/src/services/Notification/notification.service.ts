import notificationQueue from "src/bull/queues/notification.queue.js";
import { redis } from "src/configs/redis.js";
import type { INotification } from "src/models/Notification/notification.model.js";
import { notificationRepository } from "src/repositories/notification.repository.js";
import logger from "src/utils/logger.js";

// Queue payload now expects an existing ID
export interface NotificationQueuePayload {
    notificationId: string;
    courseId?: string; // Optional target override
}

export class NotificationService {
    /**
     * Create & Send Notification (Instructor)
     * 1. Creates Master Record
     * 2. Pushes to Queue for delivery
     */
    static async sendNotification(data: Partial<INotification>) {
        try {
            // 1. Create DB Record
            const notification = await notificationRepository.create(data);

            // 2. Push to Queue
            await notificationQueue.add("notification:send", {
                notificationId: notification._id.toString(),
                courseId: data.courseId
            });

            return notification;
        } catch (error) {
            logger.error("Failed to send notification", error);
            throw error;
        }
    }

    /**
     * Update Notification (Instructor)
     */
    static async updateNotification(id: string, data: Partial<INotification>) {
        return notificationRepository.updateById(id, data);
    }

    /**
     * Delete Notification (Instructor)
     */
    static async deleteNotification(id: string) {
        return notificationRepository.deleteById(id);
    }

    /**
     * Get Sent Notifications (Instructor)
     */
    static async getSentNotifications(userId: string, limit: number, skip: number) {
        return notificationRepository.findByCreator(userId, limit, skip);
    }

    /**
     * Get user's notifications (Student)
     */
    static async getUserNotifications(userId: string, cursor?: string, limit: number = 20) {
        const { items, nextCursor } = await notificationRepository.getUserNotifications(userId, cursor, limit);

        return {
            items: items.map(item => ({
                ...item,
                notification: item.notificationId
            })),
            nextCursor
        };
    }

    /**
     * Get unread count (Redis -> DB fallback)
     */
    static async getUnreadCount(userId: string): Promise<number> {
        const redisKey = `user:unread:${userId}`;
        const cachedCount = await redis.get(redisKey);

        if (cachedCount !== null) {
            return parseInt(cachedCount, 10);
        }

        const count = await notificationRepository.countUnread(userId);
        await redis.set(redisKey, count);
        return count;
    }

    /**
     * Mark specific notifications as read
     */
    static async markAsRead(userId: string, notificationIds: string[]) {
        const result = await notificationRepository.markAsRead(userId, notificationIds);

        if (result.modifiedCount > 0) {
            const redisKey = `user:unread:${userId}`;
            const current = await redis.get(redisKey);
            if (current) {
                const newVal = Math.max(0, parseInt(current) - result.modifiedCount);
                await redis.set(redisKey, newVal);
            }
        }
        return result.modifiedCount;
    }

    /**
     * Mark ALL as read
     */
    static async markAllAsRead(userId: string) {
        await notificationRepository.markAllAsRead(userId);
        await redis.set(`user:unread:${userId}`, 0);
        return { success: true };
    }
}

import { NotificationModel, type INotification } from "src/models/Notification/notification.model.js";
import { UserNotificationModel } from "src/models/user/userNotification.model.js";
import { Types } from "mongoose";

export const notificationRepository = {
    // Create new notification master record
    create: async (data: Partial<INotification>) => {
        return NotificationModel.create(data);
    },

    // Find notification by ID
    findById: async (id: string | Types.ObjectId) => {
        return NotificationModel.findById(id);
    },

    // Update notification details
    updateById: async (id: string | Types.ObjectId, data: Partial<INotification>) => {
        return NotificationModel.findByIdAndUpdate(id, data, { new: true });
    },

    // Delete notification (and cascade to user notifications)
    deleteById: async (id: string | Types.ObjectId) => {
        await UserNotificationModel.deleteMany({ notificationId: id });
        return NotificationModel.findByIdAndDelete(id);
    },

    // Find notifications created by a specific user (Instructor)
    findByCreator: async (userId: string | Types.ObjectId, limit: number = 20, skip: number = 0) => {
        const query = { createdBy: new Types.ObjectId(userId) };
        const [items, total] = await Promise.all([
            NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            NotificationModel.countDocuments(query)
        ]);
        return { items, total };
    },

    // Get User Notifications (Student view)
    getUserNotifications: async (userId: string | Types.ObjectId, cursor?: string, limit: number = 20) => {
        const query: any = { userId: new Types.ObjectId(userId) };
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }

        const items = await UserNotificationModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("notificationId")
            .lean();

        const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;

        return { items, nextCursor };
    },

    // Count unread for user
    countUnread: async (userId: string | Types.ObjectId) => {
        return UserNotificationModel.countDocuments({
            userId: new Types.ObjectId(userId),
            isRead: false
        });
    },

    // Mark specific as read
    markAsRead: async (userId: string | Types.ObjectId, ids: string[]) => {
        return UserNotificationModel.updateMany(
            {
                userId: new Types.ObjectId(userId),
                notificationId: { $in: ids.map(id => new Types.ObjectId(id)) },
                isRead: false
            },
            { $set: { isRead: true, readAt: new Date() } }
        );
    },

    // Mark all as read
    markAllAsRead: async (userId: string | Types.ObjectId) => {
        return UserNotificationModel.updateMany(
            { userId: new Types.ObjectId(userId), isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
    }
};

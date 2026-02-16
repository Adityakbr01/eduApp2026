import { model, Schema, Types } from "mongoose";

export interface IUserNotification {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    notificationId: Types.ObjectId;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userNotificationSchema = new Schema<IUserNotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        notificationId: { type: Schema.Types.ObjectId, ref: "Notification", required: true },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

// Compound indexes for common queries
userNotificationSchema.index({ userId: 1, isRead: 1 }); // Get unread count
userNotificationSchema.index({ userId: 1, createdAt: -1 }); // Get feed

export const UserNotificationModel = model<IUserNotification>("UserNotification", userNotificationSchema);

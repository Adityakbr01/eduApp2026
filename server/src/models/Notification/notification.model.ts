import { model, Schema, Types } from "mongoose";

export interface INotification {
    _id: Types.ObjectId;
    courseId: Types.ObjectId;
    title: string;
    message: string;
    category: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    type: string; // e.g., "COURSE_UPDATE", "ASSIGNMENT_GRADED"
    link?: string;
    createdBy: Types.ObjectId;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        category: {
            type: String,
            enum: ["INFO", "ALERT", "SUCCESS", "WARNING"],
            default: "INFO",
            required: true,
        },
        level: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "LOW",
            required: true,
        },
        type: { type: String, default: "GENERAL" },
        link: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        expiresAt: { type: Date, expires: 0 }, // TTL index auto-delete
    },
    { timestamps: true }
);

// Index for dashboard queries
notificationSchema.index({ createdAt: -1 });

export const NotificationModel = model<INotification>("Notification", notificationSchema);

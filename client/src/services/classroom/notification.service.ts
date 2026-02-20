import axios from "@/lib/api/axios";

// Base URL is already configured in axios instance, usually
const BASE_URL = "/notifications";

export interface Notification {
    _id: string;
    courseId?: string;
    title: string;
    message: string;
    category: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    type: string;
    link?: string;
    createdAt: string;
    createdBy?: string;
}

export interface UserNotification {
    _id: string;
    notification: Notification;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

export const NotificationService = {
    // Student Methods
    async getAll(cursor?: string, limit: number = 20) {
        const res = await axios.get(`${BASE_URL}`, {
            params: { cursor, limit }
        });
        return res.data;
    },

    async getUnreadCount() {
        const res = await axios.get(`${BASE_URL}/unread-count`);
        return res.data;
    },

    async markAsRead(id: string) {
        const res = await axios.patch(`${BASE_URL}/${id}/read`);
        return res.data;
    },

    async markAllAsRead() {
        const res = await axios.patch(`${BASE_URL}/read-all`);
        return res.data;
    },

    // Instructor Methods
    async sendNotification(data: Partial<Notification>) {
        const res = await axios.post(`${BASE_URL}/instructor/send`, data);
        return res.data;
    },

    async getSentNotifications(page: number = 1, limit: number = 20) {
        const res = await axios.get(`${BASE_URL}/instructor/sent`, {
            params: { page, limit }
        });
        return res.data;
    },

    async updateNotification(id: string, data: Partial<Notification>) {
        const res = await axios.patch(`${BASE_URL}/instructor/${id}`, data);
        return res.data;
    },

    async deleteNotification(id: string) {
        const res = await axios.delete(`${BASE_URL}/instructor/${id}`);
        return res.data;
    }
};

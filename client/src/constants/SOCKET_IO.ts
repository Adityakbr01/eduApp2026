export const socketUrl =
    process.env.NODE_ENV === "production"
        ? "https://app.edulaunch.shop"
        : "http://localhost:3001";


export const getSocketUrl = () => {
    try {
        return new URL(socketUrl).origin;
    } catch (e) {
        console.error("Invalid API URL for socket:", socketUrl);
        return "http://localhost:3001";
    }
};


export const SOCKET_KEYS = {
    COURSE_ROOM: "course-room",
    LEADERBOARD_UPDATE: {
        JOIN: "join-course-room",
        LEAVE: "leave-course-room",
        UPDATE: "leaderboard:update",
    },
    LIVE_STREAM: {
        JOIN: "join-live-class-room",
        LEAVE: "leave-live-class-room",
        STATUS_CHANGED: "live-stream:status-changed",
        VIEWER_COUNT: "live-stream:viewer-count",
    },
}
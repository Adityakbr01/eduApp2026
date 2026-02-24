const SOCKET_KEYS = {
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

export default SOCKET_KEYS  
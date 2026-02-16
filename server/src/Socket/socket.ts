import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger.js";
import { env } from "../configs/env.js";

let io: SocketIOServer | null = null;

import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "../configs/redis.js";
import SOCKET_KEYS from "src/constants/SOCKET_KEYS.js";

export const initSocket = async (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        path: "/socket.io",
        cors: {
            origin: [
                env.CLIENT_ORIGIN,
                env.CLIENT_URL,
                "http://localhost:3000",
                "https://app.edulaunch.shop"
            ],
            methods: ["GET", "POST"],
            credentials: true
        },
        // Production optimizations
        transports: ["websocket", "polling"],
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
        connectTimeout: 45000, // 45 seconds
        maxHttpBufferSize: 1e6, // 1MB
        allowEIO3: true, // Allow older clients
    });


    const pubClient = redis;
    const subClient = redis.duplicate();

    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
        logger.info(`🔌 Socket connected: ${socket.id} | Origin: ${socket.handshake.headers.origin}`);

        // Join User Room
        const userId = socket.handshake.query.userId as string;
        if (userId) {
            socket.join(`user:${userId}`);
            logger.debug(`Socket ${socket.id} joined room user:${userId}`);

            // Set online status
            redis.set(`online:${userId}`, "true", "EX", 60); // 60s TTL
        }

        // Heartbeat for online status
        socket.on("heartbeat", (uid: string) => {
            if (uid) {
                redis.set(`online:${uid}`, "true", "EX", 60);
            }
        });

        socket.on("disconnect", (reason) => {
            logger.info(`❌ Socket disconnected: ${socket.id} | Reason: ${reason}`);
            if (userId) {
                redis.del(`online:${userId}`);
            }
        });

        socket.on("error", (err) => {
            logger.error(`⚠️ Socket error: ${socket.id}`, err);
        });


        // Use a consistent naming convention for rooms: course:{courseId}
        socket.on(SOCKET_KEYS.LEADERBOARD_UPDATE.JOIN, (courseId: string) => {
            // Leave previous course rooms if needed? 
            // Socket.IO supports multiple rooms. 
            // Ideally client sends this when entering the page.
            if (courseId) {
                const roomName = `course:${courseId}`;
                socket.join(roomName);
                logger.debug(`Socket ${socket.id} joined room ${roomName}`);
            }
        });

        socket.on(SOCKET_KEYS.LEADERBOARD_UPDATE.LEAVE, (courseId: string) => {
            if (courseId) {
                const roomName = `course:${courseId}`;
                socket.leave(roomName);
                logger.debug(`Socket ${socket.id} left room ${roomName}`);
            }
        });
    });

    logger.info("✅ Socket.IO initialized with Redis Adapter (using shared config)");
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};

// Typed event emitter helper
export const emitLog = (log: any) => {
    if (io) {
        io.emit("new-log", log);
    }
};

/**
 * Emit leaderboard update to a specific course room.
 * This triggers clients to refetch the leaderboard.
 */
export const emitLeaderboardUpdate = (courseId: string, data?: any) => {
    if (io) {
        // Emit to the specific course room
        io.to(`course:${courseId}`).emit(SOCKET_KEYS.LEADERBOARD_UPDATE.UPDATE, {
            courseId,
            timestamp: new Date(),
            ...data
        });
    }
};

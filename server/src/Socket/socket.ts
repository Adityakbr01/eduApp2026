import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger.js";
import { env } from "../configs/env.js";

let io: SocketIOServer | null = null;

import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "../configs/redis.js";

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
        console.info(`🔌 Socket connected: ${socket.id}`);

        socket.on("disconnect", () => {
            // logger.info(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    console.info("✅ Socket.IO initialized with Redis Adapter (using shared config)");
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

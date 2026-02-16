"use client";

import { socketUrl } from "@/constants/SOCKET_IO";
import {
  NotificationService,
  type UserNotification,
} from "@/services/classroom/notification.service";
import { useAuthStore } from "@/store/auth";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { NotificationCard } from "./NotificationCard";

const Notifications = () => {
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const user = useAuthStore((state) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNotifications = useCallback(
    async (currentCursor?: string | null) => {
      try {
        if (!currentCursor) setLoading(true);

        const [notifsResponse, countResponse] = await Promise.all([
          NotificationService.getAll(currentCursor || undefined),
          !currentCursor
            ? NotificationService.getUnreadCount()
            : Promise.resolve(null),
        ]);

        const { items, nextCursor: newNextCursor } = notifsResponse.data;

        setNotifications((prev) => {
          if (currentCursor) return [...prev, ...items];
          return items;
        });

        setNextCursor(newNextCursor);
        setHasMore(!!newNextCursor);

        if (countResponse) {
          setUnreadCount(countResponse.data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const loadMore = () => {
    if (nextCursor) {
      fetchNotifications(nextCursor);
    }
  };

  // Socket Connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(socketUrl, {
      path: "/socket.io",
      query: { userId: user.id || user.userId },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("🔔 Notification Socket Connected");
      const interval = setInterval(() => {
        newSocket.emit("heartbeat", user.id || user.userId);
      }, 30000);

      return () => clearInterval(interval);
    });

    newSocket.on("notification:new", (newNotif: any) => {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }

      const newNotification: UserNotification = {
        _id: `temp-${Date.now()}`,
        notification: newNotif,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = async (id: string, notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await NotificationService.markAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark read", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  const handleDelete = async (id: string) => {
    const notification = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Add API call to delete notification if you have one
    // await NotificationService.delete(id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.isRead);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      // Assuming you have a bulk mark as read endpoint
      await Promise.all(
        unreadNotifs.map((n) =>
          NotificationService.markAsRead(n.notification._id),
        ),
      );
    } catch (err) {
      console.error("Failed to mark all as read", err);
      fetchNotifications(); // Refresh on error
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const visibleNotifications = expanded
    ? filteredNotifications
    : filteredNotifications.slice(0, 3);

  const stackedOffset = 12;
  const scaleStep = 0.04;

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[30vh] w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Bell className="w-8 h-8 text-white/20" />
        </motion.div>
        <p className="text-xs text-white/40 mt-3">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[30vh] w-full relative">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/audio/notificationSound.mp3" preload="auto" />

      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-white/5 to-transparent">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-1.5 rounded-lg bg-primary/10 border border-primary/20"
            >
              <Bell className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold text-white/90">
              Notifications
            </span>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-(--custom-successColor) text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="text-[10px] px-2.5 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
              >
                Mark all read
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(!expanded)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Expand
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filter tabs */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("unread")}
              className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-medium ${
                filter === "unread"
                  ? "bg-white/10 text-white shadow-sm"
                  : "bg-transparent text-white/50 hover:text-white/70"
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              onClick={() => setFilter("all")}
              className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-medium ${
                filter === "all"
                  ? "bg-white/10 text-white shadow-sm"
                  : "bg-transparent text-white/50 hover:text-white/70"
              }`}
            >
              All ({notifications.length})
            </button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="relative flex-1 p-4 gap-2 overflow-y-auto custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-white/20 py-12"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Bell className="w-12 h-12 mb-4 opacity-50" />
            </motion.div>
            <span className="text-sm font-medium mb-1">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </span>
            <span className="text-xs text-white/30">
              {filter === "unread"
                ? "You've read all your notifications"
                : "We'll notify you when something happens"}
            </span>
          </motion.div>
        ) : (
          <div
            className="relative flex flex-col gap-2"
            style={{ minHeight: expanded ? "auto" : "100%" }}
          >
            <AnimatePresence mode="popLayout">
              {visibleNotifications.map((item, index) => (
                <NotificationCard
                  key={item._id}
                  item={item}
                  index={index}
                  expanded={expanded}
                  stackedOffset={stackedOffset}
                  scaleStep={scaleStep}
                  totalNotifications={filteredNotifications.length}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>

            {/* Stack hint */}
            {!expanded && filteredNotifications.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute flex-1 bottom-0 left-0 gap-3 right-0 text-center py-3 pointer-events-none"
              >
                <span className="text-[11px] text-white/40  px-3 py-1.5 rounded-full  border border-white/10">
                  +{filteredNotifications.length - 3} more notifications
                </span>
              </motion.div>
            )}
          </div>
        )}

        {/* Load more */}
        {expanded && hasMore && filteredNotifications.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadMore}
            className="w-full h-full flex-1 py-3 mt-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors border border-white/10"
          >
            Load more
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Notifications;

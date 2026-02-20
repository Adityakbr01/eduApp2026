import React, { useState, useCallback, useMemo } from "react";
import { UserNotification } from "@/services/classroom/notification.service";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  CircleCheck,
  Info,
  MessageCircle,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "motion/react";
import formatTimestamp from "@/lib/utils/formatTimestamp";

type NotificationCategory =
  | "ALERT"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "MESSAGE";

interface CategoryStyle {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  shadowColor: string;
}

const categoryConfig: Record<NotificationCategory, CategoryStyle> = {
  ALERT: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    shadowColor: "shadow-red-500/10",
  },
  SUCCESS: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    shadowColor: "shadow-emerald-500/10",
  },
  WARNING: {
    icon: <Bell className="w-4 h-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    shadowColor: "shadow-amber-500/10",
  },
  INFO: {
    icon: <Info className="w-4 h-4" />,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    shadowColor: "shadow-sky-500/10",
  },
  MESSAGE: {
    icon: <MessageCircle className="w-4 h-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    shadowColor: "shadow-purple-500/10",
  },
};

const DRAG_THRESHOLD = 100;

interface NotificationCardProps {
  item: UserNotification;
  index: number;
  expanded: boolean;
  stackedOffset: number;
  scaleStep: number;
  totalNotifications: number;
  onMarkAsRead: (id: string, notificationId: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  index,
  expanded,
  stackedOffset,
  scaleStep,
  totalNotifications,
  onMarkAsRead,
  onDelete,
}) => {
  const { notification, isRead } = item;
  const config =
    categoryConfig[notification.category as NotificationCategory] ??
    categoryConfig.INFO;

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      setIsDragging(false);

      if (Math.abs(info.offset.x) > DRAG_THRESHOLD) {
        if (info.offset.x > 0 && !isRead) {
          onMarkAsRead(item._id, notification._id);
        } else if (info.offset.x < 0) {
          onDelete(item._id);
        }
      }
    },
    [isRead, item._id, notification._id, onDelete, onMarkAsRead],
  );

  const handleClick = useCallback(() => {
    if (!expanded || isDragging) return;

    if (!isRead) {
      onMarkAsRead(item._id, notification._id);
    }

    if (notification.link) {
      window.open(notification.link, "_blank");
    }
  }, [expanded, isDragging, isRead, item._id, notification, onMarkAsRead]);

  const containerClasses = useMemo(() => {
    const base =
      "relative flex flex-col gap-2 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 overflow-hidden group";

    if (isRead) {
      return `${base} border-white/5 bg-dark-extra-light/50`;
    }

    return `${base} ${config.borderColor} ${config.bgColor} shadow-lg ${config.shadowColor}`;
  }, [isRead, config]);

  return (
    <motion.div
      layout
      key={item._id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: expanded ? 0 : index * stackedOffset,
        scale: expanded ? 1 : 1 - index * scaleStep,
        zIndex: totalNotifications - index,
      }}
      exit={{
        opacity: 0,
        x: x.get() > 0 ? 300 : -300,
        scale: 0.8,
      }}
      style={{
        position: expanded ? "relative" : "absolute",
        width: expanded ? "100%" : `${100 - index * 2}%`,
        x: expanded ? x : 0,
        opacity,
      }}
      drag={expanded ? "x" : false}
      dragElastic={0.6}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className={containerClasses}
      onClick={handleClick}
    >
      <div
        className={`flex items-start justify-between gap-3 ${notification.link && "cursor-pointer"}`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`p-2 rounded-lg shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}
          >
            {config.icon}
          </motion.div>

          <div className="flex flex-col flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold ${
                isRead ? "text-white/60" : "text-white"
              }`}
            >
              {notification.title}
            </h3>

            <p
              className={`text-xs leading-relaxed ${
                isRead ? "text-white/40" : "text-white/70"
              } ${expanded ? "line-clamp-3" : "line-clamp-1"}`}
            >
              {notification.message}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] text-white/40 px-2 py-1 rounded-md bg-white/5">
            {formatTimestamp(item.createdAt || notification.createdAt)}
          </span>

          {!isRead && (
            <div className="relative flex items-center justify-center">
              {/* Main Dot */}
              <span className="relative z-10 w-2 h-2 rounded-full bg-[var(--custom-accentColor)]" />

              {/* Glow Wave */}
              <motion.span
                className="absolute w-2 h-2 rounded-full bg-[var(--custom-accentColor)]"
                animate={{
                  scale: [1, 3],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {expanded && !isRead && (
        <div className="absolute  top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(item._id, notification._id);
            }}
            className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400"
          >
            <CircleCheck className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

type NotificationCategory =
  | "alert"
  | "info"
  | "success"
  | "warning"
  | "message";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  category: NotificationCategory;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Class Rescheduled",
    message: "The 'Advanced React Patterns' class has been moved to 5:00 PM.",
    time: "10m ago",
    category: "alert",
    read: false,
  },
  {
    id: "2",
    title: "Assignment Graded",
    message: "Your submission for 'Project Alpha' has been graded. Great work!",
    time: "1h ago",
    category: "success",
    read: false,
  },
  {
    id: "3",
    title: "System Maintenance",
    message: "Platform maintenance scheduled for Saturday at 2:00 AM UTC.",
    time: "2h ago",
    category: "info",
    read: true,
  },
  {
    id: "4",
    title: "Deadline Approaching",
    message: "Reminder: 'Full Stack Quiz' is due in 3 hours.",
    time: "3h ago",
    category: "warning",
    read: false,
  },
  {
    id: "5",
    title: "New Discussion Reply",
    message: "Alex replied to your comment in 'General Discussion'.",
    time: "5h ago",
    category: "message",
    read: true,
  },
];

const categoryConfig: Record<
  NotificationCategory,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  alert: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  warning: {
    icon: <Bell className="w-4 h-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    color: "text-sky-400",
    bgColor: "bg-sky-500/20",
  },
  message: {
    icon: <MessageCircle className="w-4 h-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
};

const Notifications = () => {
  const [expanded, setExpanded] = useState(false);
  // Initially show only top 2 if not expanded
  const visibleNotifications = expanded
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.slice(0, 3);

  const stackedOffset = 10; // Vertical overlapping distance
  const scaleStep = 0.05; // Scale difference between items in stack

  return (
    <div className="flex flex-col h-full min-h-[30vh] w-full relative">
      {/* Header / Controls */}
      <div className="flex justify-between items-center px-4 py-2 z-10">
        <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
          Recent Updates
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          {expanded ? "Show Less" : "Show All"}
        </button>
      </div>

      <div className="relative flex-1 p-4 pt-2 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {visibleNotifications.map((notification, index) => {
            const config = categoryConfig[notification.category];

            // Stack logic when NOT expanded
            const isStacked = !expanded && index > 0;
            const stackIndex = index;

            return (
              <motion.div
                layout
                key={notification.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: expanded ? 0 : stackIndex * stackedOffset,
                  scale: expanded ? 1 : 1 - stackIndex * scaleStep,
                  zIndex: MOCK_NOTIFICATIONS.length - index,
                  // Removed dynamic filter blur which is expensive on mobile
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{
                  type: "spring",
                  stiffness: 400, // Faster, snappier
                  damping: 30,
                  mass: 1,
                }}
                style={{
                  position: expanded ? "relative" : "absolute",
                  top: expanded ? 0 : 10,
                  width: "100%",
                  transformOrigin: "top center",
                  // Hardware acceleration hints
                  willChange: "transform, opacity",
                }}
                className={`flex flex-col gap-2 p-4 rounded-2xl border border-white/5 bg-[#1e1e1e] shadow-lg mb-3 cursor-pointer group hover:bg-[#252525] transition-colors`}
                onClick={() => !expanded && setExpanded(true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-full shrink-0 ${config.bgColor} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-medium text-white/90">
                        {notification.title}
                      </h3>
                      <p className="text-xs text-white/50 line-clamp-1 font-apfel">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/30 whitespace-nowrap bg-white/5 px-2 py-1 rounded-full">
                    {notification.time}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!expanded && MOCK_NOTIFICATIONS.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/30 pointer-events-none"
          >
            Tap top stack to expand
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

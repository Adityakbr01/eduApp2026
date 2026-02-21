"use client";

import { motion, AnimatePresence } from "motion/react";
import toast, { Toast } from "react-hot-toast";

interface NotificationToastProps {
  t: Toast;
  title?: string;
  body?: string;
  url?: string;
}

export default function NotificationToast({
  t,
  title,
  body,
  url = "/",
}: NotificationToastProps) {
  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
          onClick={() => {
            toast.dismiss(t.id);
            window.location.href = url;
          }}
          whileHover="hover"
          style={{
            cursor: "pointer",
            // A deep, elegant dark gradient background
            background:
              "linear-gradient(145deg, rgba(28,28,32,0.95) 0%, rgba(20,20,24,0.95) 100%)",
            color: "#fafafa",
            padding: "16px",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            minWidth: "320px",
            maxWidth: "420px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            pointerEvents: "auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle ambient glow behind the content */}
          <motion.div
            variants={{
              hover: { opacity: 1, scale: 1.1 },
            }}
            initial={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-50%",
              left: "-10%",
              width: "140%",
              height: "150%",
              background:
                "radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 50%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Animated Icon Container */}
          <motion.div
            variants={{
              hover: { scale: 1.05 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#a78bfa",
              position: "relative",
              zIndex: 1,
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
            }}
          >
            {/* SVG Bell with ringing keyframe animation */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ rotate: 0 }}
              animate={{
                // More dynamic, physics-like ring sequence
                rotate: [0, -20, 25, -20, 15, -10, 5, 0],
              }}
              transition={{
                duration: 1.4,
                ease: "easeInOut",
                delay: 0.3,
                // Loop occasionally if desired, but running once on enter is cleaner
              }}
              style={{ originX: 0.5, originY: 0.1 }}
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </motion.svg>
          </motion.div>

          {/* Text Content Container */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
              marginTop: "2px",
            }}
          >
            {title && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                style={{
                  fontWeight: 600,
                  fontSize: "14.5px",
                  lineHeight: "1.3",
                  color: "#f8fafc",
                  marginBottom: body ? "6px" : "0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </motion.div>
            )}

            {body && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
                style={{
                  fontSize: "13px",
                  color: "#a1a1aa",
                  lineHeight: "1.5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {body}
              </motion.div>
            )}
          </div>

          {/* SVG Dismiss button */}
          <motion.button
            whileHover={{
              scale: 1.15,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#fafafa",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            aria-label="Dismiss notification"
            style={{
              background: "transparent",
              border: "none",
              color: "#52525b",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              zIndex: 1,
              marginTop: "-4px",
              marginRight: "-6px",
              transition: "color 0.2s ease, background-color 0.2s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

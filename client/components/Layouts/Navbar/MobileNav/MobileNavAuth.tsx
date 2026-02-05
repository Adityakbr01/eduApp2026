"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/services/auth/mutations";
import { authButtonVariants } from "./variants";

interface MobileNavAuthProps {
  onClose: () => void;
}

export default function MobileNavAuth({ onClose }: MobileNavAuthProps) {
  const router = useRouter();
  const { isLoggedIn, hydrated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        onClose();
        router.push("/");
      },
      onError: () => {
        onClose();
        router.push("/");
      },
    });
  };

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10"
      variants={authButtonVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {!hydrated ? (
        <div className="flex flex-col gap-3">
          <div className="w-full h-12 bg-white/10 rounded-lg animate-pulse" />
        </div>
      ) : isLoggedIn ? (
        <motion.button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoggingOut ? 1 : 1.02 }}
          whileTap={{ scale: isLoggingOut ? 1 : 0.98 }}
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </motion.button>
      ) : (
        <div className="flex flex-col gap-3">
          <Link href="/signin" onClick={onClose}>
            <motion.button
              className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/signup" onClick={onClose}>
            <motion.button
              className="w-full px-4 py-3 bg-[#e8602e] text-white rounded-lg hover:bg-[#ff733e] transition text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

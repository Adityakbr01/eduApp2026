"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/services/auth/mutations";
import { mainNavLinks, getFullMenuForRole } from "./nav.config";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

// Container variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 300,
      delay: 0.2,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

const authButtonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.35,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, hydrated } = useAuthStore();

  // Use the logout mutation hook for proper API call
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Get menu items based on user's role - memoized for performance
  const roleMenuItems = useMemo(
    () => getFullMenuForRole(user?.roleName),
    [user?.roleName]
  );

  // Check if link is active
  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Note: Body scroll lock is handled by parent Nav component
  // using the body-scroll-locked CSS class for better scroll position restoration

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        onClose();
        router.push("/");
      },
      onError: () => {
        // Even on error, close menu - clearAuth is called in the mutation
        onClose();
        router.push("/");
      },
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Mobile Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-70 bg-linear-to-b from-[#171212] to-[#100B0B] z-50"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header spacer for hamburger alignment */}
            <div className="h-20" />

            {/* User Profile Section (when logged in) */}
            {hydrated && isLoggedIn && user && (
              <motion.div
                className="px-6 py-4 border-b border-white/10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-[#e8602e] to-[#ff733e] flex items-center justify-center shrink-0">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "Profile"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-white text-lg font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-white/50 text-sm truncate">{user?.email || ""}</p>
                    {user?.roleName && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded-full capitalize">
                        {user.roleName}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Links */}
            <motion.nav
              className="flex flex-col px-6 py-4 gap-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {mainNavLinks.map((link) => {
                const isActive = isActiveLink(link.href);

                const content = (
                  <motion.div
                    className={`py-2 px-4 rounded-lg transition-colors duration-200 text-lg font-medium ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-white/70 hover:text-[#e8602e] hover:bg-white/5"
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      {link.label}
                      {isActive && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-white"
                          layoutId="activeDot"
                        />
                      )}
                    </div>
                  </motion.div>
                );

                if (link.isButton) {
                  return (
                    <motion.button
                      key={link.label}
                      type="button"
                      className="text-left"
                      aria-label={link.label}
                      onClick={onClose}
                      variants={navItemVariants}
                    >
                      {content}
                    </motion.button>
                  );
                }

                if (link.external) {
                  return (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      variants={navItemVariants}
                    >
                      {content}
                    </motion.a>
                  );
                }

                return (
                  <motion.div key={link.label} variants={navItemVariants}>
                    <Link href={link.href || "#"} onClick={onClose}>
                      {content}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Role-based menu items for logged in users */}
              {hydrated && isLoggedIn && roleMenuItems.map((item) => (
                <motion.div key={item.href} variants={navItemVariants}>
                  <Link href={item.href} onClick={onClose}>
                    <motion.div
                      className={`py-1 px-4 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-3 ${
                        pathname.startsWith(item.href)
                          ? "text-white bg-white/10"
                          : "text-white/70 hover:text-[#e8602e] hover:bg-white/5"
                      }`}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Auth Buttons / Logout */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10"
              variants={authButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {!hydrated ? (
                /* Skeleton while loading */
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

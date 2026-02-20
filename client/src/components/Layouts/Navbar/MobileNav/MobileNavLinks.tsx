"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import { mainNavLinks, getFullMenuForRole } from "../nav.config";
import { containerVariants, navItemVariants } from "./variants";

interface MobileNavLinksProps {
  onClose: () => void;
  onRequestCallback?: () => void;
}

export default function MobileNavLinks({ onClose, onRequestCallback }: MobileNavLinksProps) {
  const pathname = usePathname();
  const { user, isLoggedIn, hydrated } = useAuthStore();

  const roleMenuItems = useMemo(
    () => getFullMenuForRole(user?.roleName),
    [user?.roleName]
  );

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
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
                  className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
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
              onClick={() => {
                onClose();
                if (link.label === "Request Callback") {
                  onRequestCallback?.();
                }
              }}
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
      {hydrated &&
        isLoggedIn &&
        roleMenuItems.map((item) => (
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
  );
}

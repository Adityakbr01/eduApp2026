"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, ChevronDown, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/services/auth/mutations";
import { getFullMenuForRole } from "./nav.config";

export default function ProfileDropdown() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the logout mutation hook for proper API call
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Get menu items based on user's role - memoized for performance
  const menuItems = useMemo(
    () => getFullMenuForRole(user?.roleName),
    [user?.roleName]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        router.push("/");
      },
      onError: () => {
        // Even on error, close dropdown - clearAuth is called in the mutation
        setIsOpen(false);
        router.push("/");
      },
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        disabled={isLoggingOut}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#e8602e] to-[#ff733e] flex items-center justify-center">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "Profile"}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#1a1414] to-[#100B0B] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-white/50 text-sm truncate">
                {user?.email || ""}
              </p>
              {user?.roleName && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded-full capitalize">
                  {user.roleName}
                </span>
              )}
            </div>

            {/* Menu Items - Role-based + Common */}
            <div className="py-2 max-h-64 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-white/10 py-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

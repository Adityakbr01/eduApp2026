"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { profileVariants } from "./variants";

interface User {
  name?: string;
  email?: string;
  avatar?: string;
  roleName?: string;
}

interface MobileNavProfileProps {
  user: User;
}

export default function MobileNavProfile({ user }: MobileNavProfileProps) {
  return (
    <motion.div
      className="px-6 py-4 border-b border-white/10"
      variants={profileVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
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
          <p className="text-white font-medium truncate">
            {user?.name || "User"}
          </p>
          <p className="text-white/50 text-sm truncate">{user?.email || ""}</p>
          {user?.roleName && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded-full capitalize">
              {user.roleName}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

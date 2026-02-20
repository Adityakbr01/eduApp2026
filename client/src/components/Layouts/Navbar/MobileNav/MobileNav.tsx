"use client";

import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/store/auth";
import MobileNavBackdrop from "./MobileNavBackdrop";
import MobileNavHeader from "./MobileNavHeader";
import MobileNavProfile from "./MobileNavProfile";
import MobileNavLinks from "./MobileNavLinks";
import MobileNavAuth from "./MobileNavAuth";
import { drawerVariants } from "./variants";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCallback?: () => void;
}

export default function MobileNav({ isOpen, onClose, onRequestCallback }: MobileNavProps) {
  const { user, isLoggedIn, hydrated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <MobileNavBackdrop onClose={onClose} />

          {/* Mobile Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-70 bg-linear-to-b from-[#171212] to-[#100B0B] z-50"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <MobileNavHeader />

            {hydrated && isLoggedIn && user && (
              <MobileNavProfile user={user} />
            )}

            <MobileNavLinks onClose={onClose} onRequestCallback={onRequestCallback} />

            <MobileNavAuth onClose={onClose} />

            {/* Decorative glow */}
            <div className="absolute -top-56 right-0 w-72 h-72 bg-linear-to-bl from-[#e8602e]/25 to-transparent pointer-events-none blur-3xl" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

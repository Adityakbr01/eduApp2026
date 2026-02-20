"use client";

import { motion } from "motion/react";
import { backdropVariants } from "./variants";

interface MobileNavBackdropProps {
  onClose: () => void;
}

export default function MobileNavBackdrop({ onClose }: MobileNavBackdropProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      onClick={onClose}
    />
  );
}

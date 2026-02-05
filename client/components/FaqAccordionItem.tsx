"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { FaqItem } from "@/constants/mock_data";

interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const FaqAccordionItem = ({
  item,
  isOpen,
  onToggle,
}: FaqAccordionItemProps) => {
  return (
    <div
      className="
        relative
        border border-[#302C2A]
        rounded-xl sm:rounded-2xl
        overflow-hidden
        cursor-pointer
      "
      style={{
        boxShadow: "rgba(20, 1, 1, 0.7) 0px 10px 25px inset",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Click Layer */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="absolute inset-0 z-10"
      >
        <span className="sr-only">{item.question}</span>
      </button>

      {/* Header */}
      <div className="flex  cursor-pointer items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 pointer-events-none">
        <h3
          className={`
            font-manrope font-normal
            text-[0.75rem] sm:text-[0.9rem] md:text-lg lg:text-xl
            leading-snug
            transition-colors
            ${isOpen ? "text-white" : "text-white/50"}
          `}
        >
          {item.question}
        </h3>

        <ChevronDown
          className={`
            shrink-0
            w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7
            text-white
            transition-transform duration-300
            ${isOpen ? "rotate-180 opacity-100" : "opacity-60"}
          `}
        />
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div
              className="
                px-4 pb-4
                sm:px-5 sm:pb-5
                md:px-6 md:pb-6
                font-manrope font-light
                text-[0.7rem] sm:text-[0.85rem] md:text-base
                text-white/70
                leading-relaxed
              "
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

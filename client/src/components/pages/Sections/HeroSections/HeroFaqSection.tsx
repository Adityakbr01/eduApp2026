"use client";

import { useState } from "react";
import { motion } from "motion/react";
import CornerDotsBox from "@/components/ui/CornerDotsBox";
import { faqItems } from "@/constants/mock_data";
import { FaqAccordionItem } from "@/components/FaqAccordionItem";

export default function HeroFaqSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <motion.section
      className="
        bg-black
        px-4 sm:px-6 md:px-10
        pb-20
        flex flex-col items-center gap-10
      "
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {/* Header */}
      <div className="text-center max-w-3xl">
        <CornerDotsBox className="inline-block px-4 uppercase bg-[#e8602e21] border text-[#9B9999] border-[#3a1a0e] text-sm sm:text-lg md:text-2xl font-machina font-light pt-1.5">
          FAQs
        </CornerDotsBox>

        <h2 className="
          mt-5
          text-[1.2rem] sm:text-2xl md:text-4xl
          leading-snug
          font-manrope font-medium
        ">
          <span className="text-(--custom-accentColor)">
            Frequently Asked Questions
          </span>{" "}
          From our Students
        </h2>
      </div>

      {/* Accordion */}
      <div className="w-full max-w-5xl flex flex-col gap-3 sm:gap-4">
        {faqItems.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() =>
              setOpenId(openId === item.id ? null : item.id)
            }
          />
        ))}
      </div>
    </motion.section>
  );
}

"use client";

import CornerDotsBox from "@/components/ui/CornerDotsBox";
import { ComparisonItem, othersFeatures, sheryiansFeatures } from "@/constants/mock_data";
import { CircleCheck, Layers, XCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

interface ComparisonCardProps {
  items: ComparisonItem[];
  type: "positive" | "negative";
}

const ComparisonCard = ({ items, type }: ComparisonCardProps) => {
  const isPositive = type === "positive";

  return (
    <div className="compareBG p-0.5 w-full rounded-3xl mx-auto">
      <div
        className="space-y-2 p-5 px-6 sm:px-10 rounded-3xl mx-auto"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(50,50,50,0.4) 0%, rgba(0,0,0,1) 70%)",
        }}
      >
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col">
            <div className="flex items-center md:items-start gap-3 py-4 sm:py-5">
              {isPositive ? (
                <CircleCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0 md:mt-1" >
                    
                </CircleCheck>
              ) : (
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#E8602F] bg-[#210b06] rounded-full shrink-0 md:mt-1" />
              )}
              <p className="text-[1rem] md:text-[1.6rem] leading-snug">
                {item.text}
              </p>
            </div>
            {/* Divider - hide on last item */}
            {index < items.length - 1 && (
              <div
                className="mx-auto w-1/2 h-px"
                style={{
                  background: "radial-gradient(circle, gray 0%, gray 10%, black 100%)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HeroComparisonSection() {
  return (
    <motion.section
      className="bg-black text-white py-10 md:py-16 lg:py-20 px-4 font-manrope"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="w-full sm:w-[90%] md:w-[90%] lg:w-[85%] mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col w-full items-center justify-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CornerDotsBox className="px-4 uppercase bg-[#e8602e21] border text-[#9B9999] border-[#3a1a0e] md:text-2xl text-lg font-machina font-light pt-1.5">
            <h1>Comparison</h1>
          </CornerDotsBox>

          <div className="phone:max-w-[85%]">
            <div className="text-center mx-auto mt-5 mb-8 md:mb-14 text-[1.5rem] sm:text-[2.3rem] md:text-[3.5rem] capitalize leading-[1.3] md:leading-18 w-[95%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
              What Sets Sheryians{" "}
              <span className="text-(--custom-accentColor)">Apart</span> From
              Other Coders
            </div>
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 mx-auto">
          {/* Sheryians Column */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Logo Header */}
            <div className="flex items-center justify-center gap-5 h-20 sm:h-24 mb-6 sm:mb-8">
              <Image
                src="https://dfdx9u0psdezh.cloudfront.net/logos/full-logo.webp"
                alt="Sheryians Logo"
                width={200}
                height={56}
                className="h-10 sm:h-14 w-auto"
              />
            </div>
            <ComparisonCard items={sheryiansFeatures} type="positive" />
          </motion.div>

          {/* Others Column */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Others Header */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 h-20 sm:h-24 mb-6 sm:mb-8">
              <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              <p className="text-2xl sm:text-3xl md:text-4xl font-light">Others</p>
            </div>
            <ComparisonCard items={othersFeatures} type="negative" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

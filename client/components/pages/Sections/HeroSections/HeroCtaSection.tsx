"use client";

import CornerDotsBox from "@/components/ui/CornerDotsBox";
import { motion } from "motion/react";
import Link from "next/link";

export default function HeroCtaSection() {
  return (
    <motion.section
      className="py-28 sm:py-44 lg:h-screen overflow-hidden mb-20 bg-center bg-cover text-center flex items-center justify-center flex-col"
      style={{
        backgroundImage:
          'url("https://dfdx9u0psdezh.cloudfront.net/footer/1261157240.webp")',
        backgroundRepeat: "no-repeat",
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Main Heading */}
      <motion.div
        className="font-machina font-normal w-[90%] lg:w-[70%] text-[2.2rem] sm:text-[2.7rem] md:text-[5rem] lg:text-[4.7rem] tracking-tight capitalize md:leading-20 max-sm:leading-12 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1>
          Transform Your Learning Journey into a Career Breakthrough with
        </h1>
      </motion.div>

      {/* Sheryians Badge */}
      <motion.div
        className="font-machina font-normal mt-2 w-[90%] lg:w-[70%] text-[2.2rem] sm:text-[2.7rem] md:text-[5rem] lg:text-[4.7rem] tracking-tight capitalize md:leading-20 max-sm:leading-12 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h1 >
          <CornerDotsBox className="relative w-fit mx-auto bg-[#e8602e21] border-[.5px] border-[#E8602E]/20 text-[#fadfd5] px-2 font-machina font-light leading-none inline-block pb-1 pt-2">
            Sheryians
          </CornerDotsBox>
        </h1>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="flex p-[.5px] bg-linear-to-b from-white/50 rounded-2xl to-transparent mt-12 sm:mt-16 mb-10 sm:mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href="/courses"
          className="text-white text-center group text-lg sm:text-xl md:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-2xl outline-none hover:shadow-[0_0px_40px_5px_rgba(232,96,46,0.5)] transition-all duration-300"
          style={{
            background:
              "linear-gradient(96.76deg, rgb(232, 96, 46) 5.3%, rgb(52, 14, 0) 234.66%) right center / 150% 100% border-box padding-box, border-box",
            transition: "background-position 300ms, box-shadow 300ms",
          }}
        >
          <div className="relative overflow-hidden w-max cursor-pointer mx-auto">
            <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Explore Courses <span>→</span>
            </div>
            <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
              Explore Courses <span>→</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.section>
  );
}

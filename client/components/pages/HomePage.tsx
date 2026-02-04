"use client";

import { motion } from "motion/react";
import Image from "next/image";
import HeroTopSection from "./Sections/HeroSections/HeroTopSection";
import HeroMarqueeSection from "./Sections/HeroSections/HeroMarqueeSection";
import HeroFutureReadySection from "./Sections/HeroSections/HeroFutureReadySection";
import HeroImpactSection from "./Sections/HeroSections/HeroImpactSection";
import HeroCourseSection from "./Sections/HeroSections/HeroCourseSection";

export default function HomePage() {
  return (
    <motion.main
      className="relative min-h-screen text-white overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Background (fade only) */}
      <motion.div
        className="absolute top-0 left-0 w-full -z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Mobile */}
        <div className="block md:hidden relative w-full h-[85vh]">
          <Image
            src="https://dfdx9u0psdezh.cloudfront.net/common/Background_mobile.svg"
            alt="Background mobile"
            fill
            priority
            sizes="100vw"
            className="object-center brightness-150 scale-150"
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:block relative w-full h-[165vh]">
          <Image
            src="https://dfdx9u0psdezh.cloudfront.net/common/Background.svg"
            alt="Background desktop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_60%] brightness-110 scale-110"
          />
        </div>
      </motion.div>

      {/* Content animation */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.05,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <HeroTopSection />
        <HeroMarqueeSection />
        <HeroFutureReadySection />
        <HeroImpactSection />
        <HeroCourseSection />
        <div className="h-screen w-full"></div>
      </motion.div>
    </motion.main>
  );
}

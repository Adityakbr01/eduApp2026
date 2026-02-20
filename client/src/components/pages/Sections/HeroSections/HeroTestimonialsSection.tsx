"use client";

import TestimonialCard from "@/components/TestimonialCard";
import CornerDotsBox from "@/components/ui/CornerDotsBox";
import { testimonials, testimonials2 } from "@/constants/mock_data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useRef } from "react";

export default function HeroTestimonialsSection() {
  const marqueeLeftRef = useRef<HTMLDivElement>(null);
  const marqueeRightRef = useRef<HTMLDivElement>(null);

  const marqueeLeftTween = useRef<gsap.core.Tween | null>(null);
  const marqueeRightTween = useRef<gsap.core.Tween | null>(null);

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  useGSAP(() => {
    if (marqueeLeftRef.current) {
      marqueeLeftTween.current = gsap.to(marqueeLeftRef.current, {
        xPercent: -50,
        duration: 33,
        ease: "none",
        repeat: -1,
        force3D: true,
      });
    }

    if (marqueeRightRef.current) {
      marqueeRightTween.current = gsap.fromTo(
        marqueeRightRef.current,
        { xPercent: -50 },
        {
          xPercent: 0,
          duration: 33,
          ease: "none",
          repeat: -1,
          force3D: true,
        }
      );
    }
  }, []);

  /* ✅ ROW-SPECIFIC CONTROL */
  const pauseLeft = () => isDesktop && marqueeLeftTween.current?.pause();
  const resumeLeft = () => isDesktop && marqueeLeftTween.current?.resume();

  const pauseRight = () => isDesktop && marqueeRightTween.current?.pause();
  const resumeRight = () => isDesktop && marqueeRightTween.current?.resume();

  return (
    <motion.section
      className="w-full bg-black flex flex-col items-center gap-10 py-10 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* HEADER */}
      <motion.div
        className="w-full text-center flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CornerDotsBox className="px-4 uppercase bg-[#e8602e21] border text-[#9B9999] border-[#3a1a0e] md:text-2xl text-lg font-machina font-light pt-1.5">
          <h1>Hear from our Students</h1>
        </CornerDotsBox>

        <div className="phone:max-w-[85%]">
          <div className="text-center mx-auto mt-5 mb-14 text-[1.35rem] md:text-[3.5rem] leading-[1.3] w-[90%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
            We Help{" "}
            <span className="text-[var(--custom-accentColor)]">Learners</span>{" "}
            Become Industry-Ready Developers.
          </div>
        </div>
      </motion.div>

      {/* TESTIMONIALS */}
      <div className="w-full relative overflow-hidden">
        {/* LEFT FADE */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-[25vw] bg-linear-to-r from-black to-transparent z-20" />

        {/* ROW 1 */}
        <div
          className="overflow-hidden"
          onMouseEnter={pauseLeft}
          onMouseLeave={resumeLeft}
        >
          <div
            ref={marqueeLeftRef}
            className="flex gap-8 md:gap-14 px-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>

        {/* ROW 2 */}
        <div
          className="overflow-hidden mt-8 md:mt-12"
          onMouseEnter={pauseRight}
          onMouseLeave={resumeRight}
        >
          <div
            ref={marqueeRightRef}
            className="flex gap-8 md:gap-14 px-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {[...testimonials2, ...testimonials2].map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>

        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[25vw] bg-linear-to-l from-black to-transparent z-20" />
      </div>
    </motion.section>
  );
}

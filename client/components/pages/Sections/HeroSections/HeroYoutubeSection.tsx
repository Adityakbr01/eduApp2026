"use client";

import CornerDotsBox from "@/components/ui/CornerDotsBox";
import YoutubeCard from "@/components/YoutubeCard";
import { youtubeVideos } from "@/constants/mock_data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";
import { useRef, useState } from "react";

/* Swiper (mobile only) */
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

export default function HeroYoutubeSection() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  const handleDotClick = (index: number) => {
    swiperInstance?.slideTo(index);
  };

  const isDesktop =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  useGSAP(() => {
    if (marqueeRef.current && isDesktop) {
      marqueeTween.current = gsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: 25,
        ease: "none",
        repeat: -1,
        force3D: true,
      });
    }
  }, []);

  const pauseMarquee = () => marqueeTween.current?.pause();
  const resumeMarquee = () => marqueeTween.current?.resume();

  return (
    <motion.section
      className="relative w-full flex flex-col items-center py-16 md:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* HEADER */}
      <motion.div
        className="flex flex-col w-full items-center text-center mb-8 md:mb-12 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <CornerDotsBox className="px-4 uppercase bg-[#e8602e21] border text-[#9B9999] border-[#3a1a0e] md:text-2xl text-lg font-machina font-light pt-1.5">
          <h1>YOUTUBE</h1>
        </CornerDotsBox>

        <div className="phone:max-w-[85%]">
          <div className="mt-5 text-[1.35rem] md:text-[3.5rem] leading-[1.3] w-[90%] md:w-[95%] lg:w-[72%] font-manrope font-medium mx-auto">
            <span className="text-(--custom-accentColor)">200+ free</span>{" "}
            coding tutorials on Sheryians
          </div>
        </div>
      </motion.div>

      {/* ================= DESKTOP MARQUEE ================= */}
      <div className="hidden md:block w-full overflow-hidden">
        <div
          className="overflow-hidden"
          onMouseLeave={() => {
            resumeMarquee();
            setHoveredIndex(null);
          }}
        >
          <div
            ref={marqueeRef}
            className="flex gap-8 lg:gap-10 py-4 px-6 will-change-transform"
            style={{ width: "max-content" }}
          >
            {[...youtubeVideos, ...youtubeVideos].map((video, index) => (
              <div
                key={`${video.id}-${index}`}
                onMouseEnter={() => {
                  pauseMarquee();
                  setHoveredIndex(index);
                }}
                className={`
                  transition-all duration-300
                  ${
                    hoveredIndex !== null && hoveredIndex !== index
                      ? "blur-sm opacity-40 scale-[0.96]"
                      : "opacity-100"
                  }
                `}
              >
                <YoutubeCard video={video} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MOBILE SWIPER ================= */}
      <div className="md:hidden w-full px-4 overflow-visible">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.15}
          centeredSlides={true}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          breakpoints={{
            480: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
          }}
          className="overflow-visible!"
        >
          {youtubeVideos.map((video, index) => (
            <SwiperSlide key={video.id}>
              <div
                className={`
            transition-all duration-300
            ${
              index === activeIndex
                ? "scale-100 opacity-100"
                : "scale-[0.94] opacity-60"
            }
          `}
              >
                <YoutubeCard video={video} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ✅ CUSTOM DOTS (Impact-style) */}
        <div className="flex gap-2 mt-5 py-4 items-center justify-center">
          {youtubeVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`
          h-3 w-3 rounded-full transition-all duration-300 cursor-pointer
          ${index === activeIndex ? "bg-[#edeaea] scale-110" : "bg-[#2c2b2b]"}
        `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

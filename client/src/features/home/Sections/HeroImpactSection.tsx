"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import ImpactCard from "@/components/ImpactCard";
import "swiper/css";
import CornerDotsBox from "@/components/ui/CornerDotsBox";

gsap.registerPlugin(ScrollTrigger);

export const impactCards = [
  {
    title: "Coming To Your Campus",
    description:
      "This Time The Feature Was At IIIT Bhopal, Where We Talked About How To Stay Ahead Of The Crowd.",
    tag: "Featured",
    image:
      "https://ik.imagekit.io/Sheryians/version3.0/ImpactSection/ce60de098a18936cd225dac3c7364cf48a436099.png?tr=w-900,q-60",
    hasOffset: false,
  },
  {
    title: "Sheryians' Seminar Tour",
    description:
      "We Delivered Impactful Seminars Across Multiple Campuses, Sharing Real Engineering Guidance.",
    tag: "Seminar",
    image:
      "https://ik.imagekit.io/Sheryians/version3.0/ImpactSection/4d35fe4a7d93da2696bb8eff46bd8aacee2a8612.jpg?tr=w-900,q-60",
    hasOffset: true,
  },
  {
    title: "Meet And Greet",
    description:
      "Open Conversations About Careers, Coding, Bootcamps, Internships, Real-World Engineering, And The Journey.",
    tag: "Meet-ups",
    image:
      "https://ik.imagekit.io/Sheryians/version3.0/ImpactSection/76bffc7d7f7e30e7eb21b1751529f33b5b0ab9b6.jpg?tr=w-900,q-60",
    hasOffset: false,
  },
  {
    title: "KODR Batch Outing",
    description:
      "On The Auspicious Occasion Of Independence Day, We Took Our KODR Batch For A Well Deserved Break.",
    tag: "Code & Chill",
    image:
      "https://ik.imagekit.io/Sheryians/version3.0/ImpactSection/fd042a1f4359a95ed1ba6661893f428c6737dbaa.png?tr=w-900,q-60",
    hasOffset: true,
  },
];

function HeroImpactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  // GSAP ScrollTrigger for desktop
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const wrapper = cardsWrapperRef.current;
        if (!wrapper) return;

        const totalScrollWidth = wrapper.scrollWidth - wrapper.clientWidth + 75;

        gsap.to(wrapper, {
          x: -totalScrollWidth,
          ease: "none",
          force3D: true, // Force hardware acceleration
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalScrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDotClick = (index: number) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index);
    }
  };

  return (
    <div className="w-full relative">
      <div
        ref={sectionRef}
        className="w-full mt-20 bg-black flex flex-col items-center overflow-hidden"
      >
        {/* Section Title */}
        <h1>
          <CornerDotsBox
            bgColor="bg-[#e8602e36]"
            borderColor="border-[#3a1a0e]"
            textColor="text-[#c4c4c4]"
            className="md:text-2xl text-xl font-machina font-light leading-none pt-1.5 inline-block"
          >
            Our Impact So Far
          </CornerDotsBox>
        </h1>
        {/* Section Heading */}
        <div className="phone:max-w-[85%]">
          <div className="text-center mx-auto mt-5 mb-14 text-[2.3rem] md:text-[3.5rem] capitalize leading-[1.3] md:leading-18 w-[90%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
            How We Are Doing It <span className="text-[#D35628]">Faster</span>{" "}
            and Better Than Others!
          </div>
        </div>

        {/* Mobile Swiper */}
        <div className="w-full lg:hidden px-4">
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
            {impactCards.map((card, index) => (
              <SwiperSlide key={index}>
                <div className="rounded-xl group overflow-hidden relative aspect-7/9">
                  <ImpactCard card={card} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination Dots */}
          <div className="flex gap-2 mt-5 py-4 items-center justify-center">
            {impactCards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`
                h-3 w-3 rounded-full transition-all cursor-pointer
                ${index === activeIndex ? "bg-[#edeaea] scale-110" : "bg-[#2c2b2b]"}
              `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Cards with GSAP Scroll */}
        <div className="hidden lg:block w-full overflow-hidden">
          <div
            ref={cardsWrapperRef}
            className="flex gap-8 items-start will-change-transform"
            style={{ willChange: "transform" }}
          >
            {/* Left Spacer */}
            <div className="w-[25%] shrink-0"></div>

            {/* Impact Cards */}
            {impactCards.map((card, index) => (
              <div
                key={index}
                className={`
                impactCard w-[25%] shrink-0
                rounded-xl group overflow-hidden relative aspect-7/9
                ${card.hasOffset ? "mt-20" : ""}
              `}
              >
                <ImpactCard card={card} />
              </div>
            ))}

            {/* Right Spacer */}
            <div className="w-10 shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroImpactSection;

"use client";

import HomeCourseCard from "@/components/HomeCourseCard";
import CornerDotsBox from "@/components/ui/CornerDotsBox";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface CourseCardProps {
  title: string;
  description?: string;
  hours?: string;
  hoursLabel?: string;
  certified: boolean;
  mentorSupport: boolean;
  price: string;
  originalPrice: string;
  imageUrl: string;
  imageAlt: string;
  courseLink: string;
  variant: "light" | "accent" | "dark";
  reverse?: boolean;
}


const HeroCourseSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const courses: CourseCardProps[] = [
    {
      title: "Data Science & Analytics with Gen AI",
      description:
        "Gain hands-on experience in data analysis, visualization, and AI integration.",
      hours: "250+",
      hoursLabel: "Hours",
      certified: true,
      mentorSupport: true,
      price: "6999",
      originalPrice: "14891",
      imageUrl:
        "https://dfdx9u0psdezh.cloudfront.net/courses/dfd10b8ddsda936b429.webp",
      imageAlt: "Data Science & Analytics with Gen AI",
      courseLink: "/courses/data-science-analytics-gen-ai",
      variant: "light",
      reverse: true,
    },
    {
      title:
        "2.0 Job Ready AI Powered Cohort: Complete Web Development + DSA + Gen-AI + Aptitude",
      hours: "150",
      hoursLabel: "Days",
      certified: true,
      mentorSupport: true,
      price: "5999",
      originalPrice: "11998",
      imageUrl:
        "https://dfdx9u0psdezh.cloudfront.net/courses/f0d09d530eb99c5e5e1b7b19.webp",
      imageAlt:
        "2.0 Job Ready AI Powered Cohort: Complete Web Development + DSA + Gen-AI + Aptitude",
      courseLink: "/courses/job-ready-ai-cohort",
      variant: "accent",
      reverse: false,
    },
    {
      title: "Java and DSA Domination",
      description:
        "Ace your coding interviews Master Java and DSA with our expert-led course, packed with interactive l",
      hours: "250+",
      hoursLabel: "Hours",
      certified: true,
      mentorSupport: true,
      price: "4999",
      originalPrice: "9998",
      imageUrl:
        "https://dfdx9u0psdezh.cloudfront.net/courses/j585594c42c610f52c7.webp",
      imageAlt: "Java and DSA Domination",
      courseLink: "/courses/java-dsa-domination",
      variant: "dark",
      reverse: true,
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".course-card");
      const totalCards = cards.length;

      if (totalCards === 0) return;

      // Set initial state - first card visible, rest below viewport
      cards.forEach((card, i) => {
        gsap.set(card, {
          y: i === 0 ? 0 : window.innerHeight,
          scale: 1,
        });
      });

      // Create the main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top -52%",
          end: () => `+=${totalCards * 110}%`,
          pin: true,
          scrub: 0.1,
        //   invalidateOnRefresh: true,
        },
      });

      // Animate each card (starting from the second card)
      cards.forEach((card, index) => {
        if (index === 0) return; // First card is already visible

        const prevCards = cards.slice(0, index);

        // Scale and move previous cards up
        prevCards.forEach((prevCard, i) => {
          const depth = index - i;
          tl.to(
            prevCard,
            {
              scale: 1 - depth * 0.05,
              y: depth * -30,
              duration: 1,
              ease: "none",
            },
            index - 1
          );
        });

        // Animate new card entering from bottom
        tl.to(
          card,
          {
            y: 100,
            opacity: 1,
            duration: 1,
            ease: "none",
          },
          index - 1
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [courses.length]);

  return (
    <section
      ref={sectionRef}
      className="max-md:px-8 overflow-hidden flex flex-col pb-10 md:pb-16 md:mt-44 relative text-black pt-24 items-center rounded-3xl bg-[#FFF3EF] px-0"
    >
      {/* Section Title */}
      <CornerDotsBox dotColor="bg-black/60" bgColor="bg-[#e8602e21]" textColor="text-black/90" className="mt-6 px-4 py-1.5  text-black/90 border-accent border-[0.5px] md:text-2xl text-xl font-machina font-light leading-none pt-1.5 inline-block">
            <h1 className="Section-Title">
                Courses
            </h1>
        </CornerDotsBox>

      {/* Section Heading */}
      <div className="phone:max-w-[85%]">
        <div className="text-center mx-auto mt-5 mb-14 text-[1.7rem] md:text-[3.5rem] capitalize leading-[1.3] md:leading-18 w-[90%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
          Not sure which <span className="text-accent">course fits you?</span>{" "}
          Don&apos;t worry, we&apos;re Here to Help.
        </div>
      </div>

      {/* Explore Courses Button */}
      <div className="flex p-[.5px] bg-linear-to-b from-white/50 rounded-2xl to-transparent mb-10">
        <Link
          href="/courses"
          className="text-white text-center group text-xl md:text-xl font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-2xl outline-none hover:shadow-[0_0px_40px_5px_rgba(232,96,46,0.5)] transition-all duration-300"
          style={{
            background:
              "linear-gradient(96.76deg, rgb(232, 96, 46) 5.3%, rgb(52, 14, 0) 234.66%) right center / 150% 100% border-box padding-box, border-box",
            transition: "background-position 300ms, box-shadow 300ms",
          }}
        >
          <div className="relative overflow-hidden w-max cursor-pointer mx-auto">
            <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
              Explore Courses <span className="ml-2">→</span>
            </div>
            <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
              Explore Courses <span className="ml-2">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Course Cards Stack - Scroll Trigger Container */}
      <div
        ref={triggerRef}
        className="relative w-full min-h-[80vh] sm:min-h-screen pt-6 sm:pt-10"
      >
        <div
          ref={cardsContainerRef}
          className="relative w-full h-[60vh] sm:h-[70vh] mt-6 sm:mt-12 md:h-[80vh]"
        >
          {courses.map((course, index) => (
            <HomeCourseCard key={index} {...course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCourseSection;

"use client";

import { motion } from "motion/react";
import Link from "next/link";
import CornerDotsBox from "@/components/ui/CornerDotsBox";
import CommunityCard from "@/components/CommunityCard";
import { communityItems } from "@/constants/mock_data";
import { VideoProvider } from "@/components/context/VideoContext";

export default function HeroCommunitySection() {
  return (
    <VideoProvider>
      <motion.section
        className="w-full rounded-t-3xl sm:rounded-t-4xl bg-[#FFF3EF] flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 text-black"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      {/* Header */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CornerDotsBox
          dotColor="bg-black/60"
          className="px-4 uppercase bg-[#e8602e21] text-black/90 border-[#E8602E] border-[0.5px] md:text-2xl text-lg font-machina font-light pt-1.5"
        >
          <h1>COMMUNITY</h1>
        </CornerDotsBox>

        <div className="phone:max-w-[85%]">
          <div className="text-center mx-auto mt-5 mb-10 sm:mb-14 text-[1.5rem] sm:text-[2.3rem] md:text-[3.5rem] capitalize leading-[1.3] md:leading-18 w-[95%] md:w-[95%] lg:w-[72%] font-manrope font-medium">
            They Came. They Cooked. They{" "}
            <span className="text-(--custom-accentColor)">Got Placed.</span>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="flex p-[.5px] bg-linear-to-b from-white/50 rounded-2xl to-transparent mb-10 sm:mb-16"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href="/courses"
          className="
            text-white text-center group 
            text-base sm:text-xl md:text-2xl font-bold 
            py-3 sm:py-4 px-6 sm:px-10 
            rounded-2xl outline-none 
            hover:shadow-[0_0px_40px_5px_rgba(232,96,46,0.5)] 
            transition-all duration-300
          "
          style={{
            background:
              "linear-gradient(96.76deg, rgb(232, 96, 46) 5.3%, rgb(52, 14, 0) 234.66%) right center / 150% 100%",
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

      {/* ============== MOBILE LAYOUT ============== */}
      <div className="sm:hidden flex flex-col gap-4 px-2 mx-auto w-full">
        {communityItems.map((item) => (
          <CommunityCard
            key={item.id}
            item={item}
            className={item.type === "video" ? "h-[60vh]" : "h-[50vh]"}
          />
        ))}
      </div>

      {/* ============== DESKTOP BENTO GRID ============== */}
      <motion.div
        className="
          hidden sm:grid
          grid-cols-12 lg:grid-cols-18
          grid-rows-12
          gap-3 md:gap-4 lg:gap-6
          px-4 md:px-6 lg:px-12 xl:px-20 
          mx-auto w-full
          max-h-[70vh] lg:max-h-screen xl:max-h-[115vh]
        "
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.2, delay: 0.4 }}
      >
        {/* Item 1: Video - Left tall */}
        <CommunityCard
          item={communityItems[0]}
          className="row-span-8 col-span-6 lg:col-span-5 col-start-1"
        />

        {/* Item 2: Image - Top center wide */}
        <CommunityCard
          item={communityItems[1]}
          className="row-span-4 col-span-6 lg:col-span-8 col-start-7 lg:col-start-6"
        />

        {/* Item 3: Image - Top right */}
        <CommunityCard
          item={communityItems[2]}
          className="row-span-4 col-span-5 col-start-7 lg:col-start-14 hidden lg:block"
        />

        {/* Item 4: Image - Middle left small */}
        <CommunityCard
          item={communityItems[3]}
          className="col-span-4 row-span-4 hidden lg:block"
        />

        {/* Item 5: Image - Middle center small */}
        <CommunityCard
          item={communityItems[4]}
          className="col-span-6 lg:col-span-4 row-span-4"
        />

        {/* Item 6: Image - Bottom wide */}
        <CommunityCard
          item={communityItems[5]}
          className="row-span-4 col-start-1 col-span-12 lg:col-span-13"
        />

        {/* Item 7: Video - Right tall */}
        <CommunityCard
          item={communityItems[6]}
          className="col-start-7 lg:col-start-14 row-start-5 row-span-8 col-span-6 lg:col-span-5"
        />
      </motion.div>
    </motion.section>
    </VideoProvider>
  );
}

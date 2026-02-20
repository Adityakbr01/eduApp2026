"use client";

import { Testimonial } from "@/constants/mock_data";
import Image from "next/image";

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    /* Outer Gradient Border */
    <div
      className="
        shrink-0
        rounded-2xl
        w-[92vw] sm:w-[20vw] md:w-[45vw] lg:w-[30vw]
        min-h-[10rem] md:min-h-[16rem]
        p-[1px]
        bg-linear-to-b
        from-[#666666]
        to-20% md:to-80%
        to-black
        z-10
        transition-transform duration-300 ease-out
        cursor-pointer
      "
    >
      {/* Inner Card */}
      <div
        className="
          relative
          w-full
          h-full
          rounded-2xl
          bg-black
          flex flex-col
          gap-5
          p-5 sm:p-6 md:p-8
          text-[#D3D3D3]
        "
        style={{
          background:
            "linear-gradient(rgb(5, 0, 0) 0%, rgb(25, 0, 0) 147.2%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/20 pb-4">
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              sizes="64px"
              className="rounded-lg object-cover"
            />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-manrope font-medium">
              {testimonial.name}
            </h2>
            <p className="text-sm sm:text-base text-white/40 font-manrope">
              {testimonial.role}
            </p>
          </div>
        </div>

        {/* Rating + Text */}
        <div className="flex flex-col gap-3">
          <p className="text-sm sm:text-base text-[#797979]">
            {testimonial.rating}.0{" "}
            {Array(testimonial.rating).fill("⭐").join(" ")}
          </p>

          <p className="
            text-base sm:text-lg md:text-xl
            font-manrope
            font-light
            text-[#D3D3D3]
            line-clamp-3
          ">
            {testimonial.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;

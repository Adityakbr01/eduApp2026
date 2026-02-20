"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Clock, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

interface CourseCardComponentProps extends CourseCardProps {
  index: number;
}




const HomeCourseCard = ({
  title,
  description,
  hours,
  hoursLabel = "Hours",
  certified,
  mentorSupport,
  price,
  originalPrice,
  imageUrl,
  imageAlt,
  courseLink,
  variant,
  reverse = false,
  index,
}: CourseCardComponentProps) => {
  const bgClasses = {
    light: "bg-white border border-[#CACACA]/50",
    accent: "bg-[#E35927] text-white",
    dark: "bg-black text-white",
  };

  const textColor = variant === "light" ? "text-black" : "text-white";
  const descriptionColor =
    variant === "light" ? "text-black/50" : "text-white/50";
  const iconBgClass = variant === "dark" ? "bg-[#180905]" : "bg-[#FDEFEA]";
  const priceSpanColor = variant ===  "accent" ? "text-black" : "text-[#E8602E]";
  const buttonClasses =
    variant === "light"
      ? "bg-black text-white hover:bg-gray-800"
      : "bg-white text-black hover:bg-gray-100";

  return (
    <div
      className={`course-card ${bgClasses[variant]} py-4 px-4 sm:p-6 lg:py-14 lg:px-12 absolute top-0 left-1/2 -translate-x-1/2 h-max w-[115%] md:w-[95%] rounded-2xl sm:rounded-4xl overflow-hidden will-change-transform`}
      style={{ zIndex: index + 1 }}
      data-card-index={index}
    >
      <div
        className={`h-max lg:gap-32 relative flex ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} md:gap-7 gap-4 flex-col-reverse justify-between overflow-hidden`}
      >
        <div className="z-10 relative flex flex-col justify-center flex-1 pt-3 sm:pt-6 lg:w-1/2">
          <div className="mt-1">
            <h2
              className={`text-xl sm:text-3xl md:text-4xl lg:text-[3.5rem] font-machina font-medium leading-tight sm:leading-tighter md:mb-4 lg:mb-2`}
              style={{
                WebkitTextStroke: "1px",
                WebkitTextFillColor: "inherit",
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                className={`${descriptionColor} tracking-wide text-sm sm:text-xl md:text-2xl lg:text-2xl font-manrope font-light lg:max-w-2xl line-clamp-2 sm:line-clamp-none`}
              >
                {description}
              </p>
            )}
            <div
              className={`flex flex-wrap mt-3 sm:mt-4 md:mt-10 lg:mt-8 lg:justify-between md:gap-10 gap-3 sm:gap-5 w-full lg:w-[60%] ${textColor}`}
            >
              {hours && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`${iconBgClass} text-[#D05528] p-2 sm:p-3 rounded-lg sm:rounded-xl`}>
                    <Clock className="size-4 sm:size-5 md:size-10 lg:size-6" aria-hidden="true" />
                  </div>
                  <div className={textColor}>
                    <h3 className="font-manrope font-semibold text-sm sm:text-base md:text-2xl lg:text-xl">
                      {hours}
                    </h3>
                    <p className="font-manrope font-medium text-xs sm:text-sm md:text-xl lg:text-base leading-4">
                      {hoursLabel}
                    </p>
                  </div>
                </div>
              )}
              {certified && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`${iconBgClass} text-[#D05528] p-2 sm:p-3 rounded-lg sm:rounded-xl`}>
                    <Award className="size-4 sm:size-5 md:size-10 lg:size-6" aria-hidden="true" />
                  </div>
                  <div className={textColor}>
                    <h3 className="font-manrope font-semibold text-sm sm:text-base md:text-2xl lg:text-xl">
                      Yes
                    </h3>
                    <p className="font-manrope font-medium text-xs sm:text-sm md:text-xl lg:text-base leading-4">
                      Certified
                    </p>
                  </div>
                </div>
              )}
              {mentorSupport && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`${iconBgClass} text-[#D05528] p-2 sm:p-3 rounded-lg sm:rounded-xl`}>
                    <Phone className="size-4 sm:size-5 md:size-10 lg:size-6" aria-hidden="true" />
                  </div>
                  <div className={textColor}>
                    <h3 className="font-manrope font-semibold text-sm sm:text-base md:text-2xl lg:text-xl">
                      24/7
                    </h3>
                    <p className="font-manrope font-medium text-xs sm:text-sm md:text-xl lg:text-base leading-4">
                      Mentor Support
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-10">
            <div className="flex items-center space-x-2 sm:space-x-4 text-lg sm:text-3xl md:text-5xl md:my-8 my-3 sm:my-6 lg:my-6">
              <div>
                <span className={`${textColor} font-manrope font-medium`}>
                  Price{" "}
                </span>
                <span className={`${priceSpanColor} font-manrope font-medium`}>
                  Rs.{price}
                </span>
                <span
                  className={`${textColor} text-xs sm:text-xl line-through ml-1 sm:ml-2`}
                >
                  Rs.{originalPrice}{" "}
                </span>
                <span className={`${textColor} text-xs sm:text-xl`}>(+GST)</span>
              </div>
            </div>
            <Link
              href={courseLink}
              className={`${buttonClasses} flex group cursor-pointer px-4 sm:px-8 rounded-xl sm:rounded-2xl py-2 sm:py-3 font-medium text-sm sm:text-xl w-fit transition-colors`}
            >
              <div className="relative overflow-hidden w-max cursor-pointer flex gap-1 font-manrope font-medium">
                <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                  Check Course →
                </div>
                <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                  Check Course →
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="relative shrink-0 lg:w-[40%] h-[18vh] sm:h-[25vh] md:h-[35vh] lg:h-[55vh]">
          <Image
            alt={imageAlt}
            className="object-cover transition-all duration-300 ease-in-out h-full w-full rounded-xl sm:rounded-2xl"
            loading="lazy"
            src={imageUrl}
            fill
            sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 50vw, 40vw"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeCourseCard;
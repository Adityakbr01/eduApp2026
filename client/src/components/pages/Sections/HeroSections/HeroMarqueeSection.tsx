"use client";

import Image from "next/image";

export default function HeroMarqueeSection() {
  const LOGO_SRC =
    "https://www.sheryians.com/images/logos/companiesLogo.png";

  return (
    <section className="w-full overflow-hidden py-0 md:py-8 lg:py-12 my-12 md:my-24">
      <div className="relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-40 bg-linear-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-linear-to-l from-black to-transparent z-10" />

        {/* Track */}
        <div className="flex w-max animate-marquee hover:paused">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="
                relative
                h-[140px] sm:h-[160px] md:h-[220px] lg:h-[260px]
                w-[900px] sm:w-[1000px] md:w-[1400px] lg:w-[1620px]
                px-24
                shrink-0
                flex items-center
              "
            >
              <Image
                src={LOGO_SRC}
                alt="Hiring partners"
                fill
                priority={i === 0}
                sizes="
                  (max-width: 640px) 900px,
                  (max-width: 1024px) 1620px,
                  1620px
                "
                className="object-contain opacity-85"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

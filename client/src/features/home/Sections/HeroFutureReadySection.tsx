"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroFutureReadySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const futureWrapperRef = useRef<HTMLDivElement>(null);
  const readyWrapperRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Desktop animations - text split and cards reveal simultaneously
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 15%",
            end: "+=250%",
            scrub: 0.01,
            pin: true,
            anticipatePin: 1, // keeping this as it helps with pinning jank on start
          },
        });

        // Initial state with will-change hint
        gsap.set(futureWrapperRef.current, {
          xPercent: 0,
          willChange: "transform",
        });
        gsap.set(readyWrapperRef.current, {
          xPercent: 0,
          willChange: "transform",
        });
        gsap.set(cardsContainerRef.current, {
          xPercent: 40,
          willChange: "transform",
        });

        // Simultaneous animation - text splits AND cards slide in together
        tl.to(
          futureWrapperRef.current,
          {
            xPercent: -100,
            duration: 0.3,
            ease: "power2.out",
            force3D: true,
          },
          0,
        )
          .to(
            readyWrapperRef.current,
            {
              xPercent: 100,
              duration: 0.3,
              ease: "power2.out",
              force3D: true,
            },
            0,
          )
          .to(
            cardsContainerRef.current,
            {
              xPercent: 0,
              duration: 0.5,
              ease: "power2.out",
              force3D: true,
            },
            0,
          );
      });

      mm.add("(max-width: 1023px)", () => {
        // Do nothing for small devices; just show scrollable cards
        gsap.set(cardsContainerRef.current, { xPercent: 0 }); // ensure it starts in place
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="Hero-future-ready-section w-full relative overflow-hidden"
    >
      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative lg:flex w-full justify-center items-center px-4 md:px-10 lg:h-[80vh]"
      >
        {/* Text Container */}
        <div className="lg:block flex gap-2 justify-center">
          {/* FUTURE - Left side */}
          <div
            ref={futureWrapperRef}
            className="w-1/2 z-[9] bg-black flex items-center lg:absolute left-0 top-0 bottom-0"
          >
            <h1 className="text-[#E8602E] text-right w-full xl:leading-[28vh] text-5xl md:text-[7rem] lg:text-[12rem] lg:absolute md:right-5 lg:right-10 font-machina font-normal">
              Future
            </h1>
          </div>

          {/* READY - Right side */}
          <div
            ref={readyWrapperRef}
            className="w-1/2 z-[9] bg-black flex items-center lg:absolute right-0 top-0 bottom-0"
          >
            <h1 className="text-[#E8602E] xl:leading-[28vh] text-5xl md:text-[7rem] lg:text-[12rem] lg:absolute md:left-5 lg:left-7 font-machina font-normal">
              Ready
            </h1>
          </div>
        </div>

        {/* Cards Container */}
        <div
          ref={cardsContainerRef}
          className="cards flex flex-row gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full py-4 md:py-6 px-2 sm:px-4 lg:overflow-visible lg:justify-center"
        >
          {/* Card 1 - Dark with Instructors */}
          <div className="h-full snap-center max-lg:shrink-0 lg:shrink w-[85%] xs:w-[75%] sm:w-[65%] md:w-[45%] lg:w-70 xl:w-103 bg-[#070707] aspect-square flex flex-col justify-between border border-white/20 rounded-lg lg:rounded-xl relative overflow-hidden">
            <div className="flex relative z-10 justify-between p-4 sm:p-6 lg:p-8 items-start">
              <div className="font-machina font-normal">
                <h1 className="text-[2.5rem] sm:text-[3rem] lg:text-[4rem] xl:text-[6rem] mt-4 sm:mt-6 lg:mt-10 leading-[.7] lg:leading-18">
                  20+
                </h1>
                <h2 className="text-[1.5rem] sm:text-[1.8rem] lg:text-[2.4rem]">
                  Instructors
                </h2>
              </div>
              <Image
                src="https://www.sheryians.com/images/home/future-ready/bag.png"
                alt="Instructors icon"
                width={80}
                height={80}
                className="h-10 sm:h-14 lg:h-20 w-auto"
              />
            </div>
            <p className="z-5 capitalize py-4 sm:py-6 lg:py-10 pt-8 sm:pt-12 lg:pt-20 relative font-manrope font-light backdrop-blur-xs text-white/50 p-4 sm:p-6 lg:p-8 text-base sm:text-lg lg:text-2xl xl:text-3xl">
              Learn directly from industry professionals.
            </p>
            <Image
              src="https://dfdx9u0psdezh.cloudfront.net/home/future-ready/1483e5e9d601e401e2822a15.webp"
              alt="Background decoration"
              width={400}
              height={400}
              className="object-contain -rotate-10 -left-30 -top-10 absolute w-full"
            />
          </div>

          {/* Card 2 - Light with Learners */}
          <div className="h-full snap-center w-[85%] xs:w-[75%] sm:w-[65%] md:w-[45%] lg:w-70 xl:w-103 max-lg:shrink-0 lg:shrink flex bg-white aspect-square flex-col justify-between border border-white/20 rounded-lg lg:rounded-xl relative overflow-hidden">
            <div
              className="flex border mt-6 sm:mt-10 lg:mt-14 border-[#3D3D3D] items-center bg-black w-[95%] sm:w-[90%] lg:w-[85%] pl-4 sm:pl-8 lg:pl-13 mx-auto rounded-full relative z-10 justify-between p-2 sm:p-3 lg:p-4"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.25) 0px 4px 18.8px 0px, rgba(255, 255, 255, 0.12) 0px -1px 6.2px 6px inset",
              }}
            >
              <div className="font-machina font-light">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                  1 Million+
                </h1>
                <p className="text-sm sm:text-base lg:text-xl xl:text-2xl ml-1 sm:ml-2">
                  Learners
                </p>
              </div>
              <div
                className="p-2 sm:p-3 lg:p-4 rounded-full border border-white/30 bg-white/10 flex items-center justify-center"
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.25) 0px 4px 18.8px 0px, rgba(255, 255, 255, 0.12) 0px -1px 6.2px 6px inset",
                }}
              >
                <ArrowUpRight
                  className="w-5 h-5 sm:w-7 sm:h-7 lg:w-9 lg:h-9"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="z-5 capitalize mb-2 sm:mb-3 relative text-black font-manrope font-light backdrop-blur-xs p-4 sm:p-6 lg:p-8 text-base sm:text-lg lg:text-2xl xl:text-3xl">
              <span className="text-black/60">Join a large and growing</span>{" "}
              <br /> community of coders
            </p>
            <Image
              src="https://dfdx9u0psdezh.cloudfront.net/home/future-ready/3a4b8f0beb17a130e5dedc86.webp"
              alt="Background decoration"
              width={400}
              height={400}
              className="object-contain h-1/2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl -rotate-40 absolute"
            />
          </div>

          {/* Card 3 - Dark with Subscribers */}
          <div className="h-full snap-center w-[85%] xs:w-[75%] sm:w-[65%] md:w-[45%] lg:w-70 xl:w-103 max-lg:shrink-0 lg:shrink bg-[#070707] aspect-square flex flex-col justify-between border border-white/20 rounded-lg lg:rounded-xl relative overflow-hidden">
            <div className="flex relative z-10 justify-between p-4 sm:p-6 lg:p-8 items-start">
              <div className="font-machina font-normal">
                <h1 className="text-[2.5rem] sm:text-[3rem] lg:text-[4rem] xl:text-[6rem] mt-4 sm:mt-6 lg:mt-10 leading-[.7] lg:leading-18">
                  628k
                </h1>
                <h2 className="text-[1.5rem] sm:text-[1.8rem] lg:text-[2.4rem] pl-1 sm:pl-2">
                  Subscribers
                </h2>
              </div>
              <Image
                src="https://www.sheryians.com/images/home/future-ready/yt.png"
                alt="YouTube icon"
                width={80}
                height={80}
                className="h-10 sm:h-14 lg:h-20 w-auto"
              />
            </div>
            <p className="z-5 capitalize mb-2 sm:mb-3 text-white/50 relative font-manrope font-light backdrop-blur-xs p-4 sm:p-6 lg:p-8 text-base sm:text-lg lg:text-2xl xl:text-3xl">
              Be part of a vibrant learning ecosystem.
            </p>
            <Image
              src="https://dfdx9u0psdezh.cloudfront.net/home/future-ready/75c961a91c5c23512e9f6c3e.webp"
              alt="Background decoration"
              fill
              className="object-cover object-center w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

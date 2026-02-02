"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="mt-4 md:mt-48 px-6 md:px-10 flex flex-col items-center text-center gap-4 md:gap-6">
      <h4 className="uppercase text-[#E8602E] text-[0.70rem] md:text-sm tracking-wider">
        Learn. Build. Get Placed.
      </h4>

      <h1 className="font-machina text-[1.65rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] leading-[1.2] sm:leading-tight max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        Transform Into the Developer{" "}
        <span className="relative inline-block px-2 sm:px-3 border border-[#E8602E] bg-[#E8602E21]">
          Recruiters
          <span className="absolute h-1 w-1 bg-white top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
          <span className="absolute h-1 w-1 bg-white top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <span className="absolute h-1 w-1 bg-white bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <span className="absolute h-1 w-1 bg-white bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </span>{" "}
        Are Searching For!
      </h1>

      <p className="text-sm md:text-2xl text-[#D7D7D7] max-w-3xl font-light">
        Join a growing community of students preparing for real-world tech careers at Sheryians.
      </p>

      {/* Student avatars */}
      <div className="flex flex-wrap justify-center text-center items-center gap-2 font-manrope font-light text-white/70 text-lg">
        <div className="w-32 flex">
          <div className="circle h-10 w-10 shrink-0 overflow-hidden border rounded-full relative">
            <Image
              src="https://ik.imagekit.io/sheryians/students/1764611471979-a5146ade-8ab9-4b7f-9855-83e80edf2e3f-1_all_6810_55Ht7UJe6.jpg?updatedAt=1764611473623"
              alt="Student"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="circle h-10 w-10 shrink-0 overflow-hidden bg-primary-50 -translate-x-[30%] border rounded-full relative">
            <Image
              src="https://ik.imagekit.io/sheryians/students/1763358465375-4932_9bX0q8pkf.jpg?updatedAt=1763358467925"
              alt="Student"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="circle h-10 w-10 overflow-hidden shrink-0 bg-primary-300 -translate-x-[60%] border rounded-full relative">
            <Image
              src="https://ik.imagekit.io/sheryians/students/1763450438835-1763450213822_GyFFcHso3.jpg?updatedAt=1763450441070"
              alt="Student"
              fill
              className="object-cover object-top"
              sizes="40px"
            />
          </div>
          <div className="circle h-10 w-10 overflow-hidden shrink-0 bg-primary-600 -translate-x-[90%] border rounded-full relative">
            <Image
              src="https://ik.imagekit.io/sheryians/students/1763383043355-1000245810_Qyc5r9LWS.jpg?updatedAt=1763383046926"
              alt="Student"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        </div>
        <span className="text-[#F34B0F] font-manrope font-bold">1 Million+</span>
        <p className="text-sm">Students learning in our mastery programs</p>
      </div>

      {/* CTA */}
      <a
        href="/courses"
        className="group mt-6 px-10 py-4 rounded-2xl text-sm md:text-xl font-medium"
        style={{
          border: "0.5px solid transparent",
          backgroundImage:
            "linear-gradient(96deg, #E8602E 5%, #340E00 230%), linear-gradient(#ECECEC, #404040)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-300 group-hover:-translate-y-full">
            Start Journey →
          </span>
          <span className="absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            Start Journey →
          </span>
        </span>
      </a>

      {/* Video Card */}
      <div className="relative mt-16 w-full max-w-5xl rounded-xl border border-white/20 backdrop-blur-xl p-5">
        <video
          className="rounded-xl w-full object-cover"
          src="https://dfdx9u0psdezh.cloudfront.net/home/hero/herosection.webm"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </section>
  );
}

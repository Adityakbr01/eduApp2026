import { MoveUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { impactCards } from "../features/home/Sections/HeroImpactSection";

function ImpactCard({ card }: { card: (typeof impactCards)[0] }) {
  return (
    <>
      {/* Bottom Overlay - Title & Description */}
      <div className="absolute flex bottom-0 group-hover:translate-y-0 transition-all duration-500 translate-y-full left-0 bg-linear-to-b from-transparent to-accent pt-10 min-h-[50%] w-full z-9999">
        <div className="p-4 sm:p-8 h-max mt-auto pt-10">
          <h1 className="font-machina font-extrabold text-xl sm:text-3xl">
            {card.title}
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            {card.description}
          </p>
        </div>
      </div>

      {/* Top Overlay - Tag Button */}
      <div className="absolute flex top-0 group-hover:opacity-100 transition-all duration-500 opacity-0 left-0 w-full z-9999">
        <div className="p-5 h-max mt-auto pt-10">
          <button className="bg-white overflow-hidden rounded-full font-manrope font-medium">
            <div className="bg-linear-to-r border border-white/20 flex items-center gap-2 px-4 py-2 from-[#FF6900] to-[#F54900]">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {card.tag}
            </div>
          </button>
        </div>
      </div>

      {/* Card Image */}
      <Image
        alt="impact"
        className="w-full object-cover transition-all duration-300 ease-in-out group-hover:grayscale h-full will-change-transform"
        loading="lazy"
        src={card.image}
        fill
        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 40vw, 25vw"
      />

      {/* Arrow Icon */}
      <div className="absolute border ease-out border-white/40 top-5 group-hover:rotate-45 transition-all duration-300 right-5 bg-[#010101] backdrop-blur-md p-[1em] md:p-4 rounded-full">
        <MoveUpRight
          className="h-[2em] w-[2em] md:h-8 md:w-8 text-white font-bold"
          aria-hidden="true"
        />
      </div>
    </>
  );
}

export default ImpactCard;

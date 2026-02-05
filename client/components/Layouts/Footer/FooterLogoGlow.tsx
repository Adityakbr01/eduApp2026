"use client";

import { useRef, useState, useCallback } from "react";

export default function FooterLogoGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative hidden cursor-pointer my-20 lg:flex h-[35vh] w-full items-center justify-center overflow-hidden"
    >
      {/* BACKGROUND GLOW */}
      <div
        className={`
          absolute inset-0
          transition-opacity duration-1000 ease-linear
          ${hover ? "opacity-100" : "opacity-0"}
        `}
      >
        <div
          className="
            absolute
            h-[40vh] aspect-square
            rounded-full
            bg-(--custom-accentColor)
            blur-[140px]
            will-change-transform
          "
          style={{
            transform: `translate(${pos.x - 200}px, ${pos.y - 200}px)`,
          }}
        />
      </div>

      {/* SVG MASK (INVERSE FILL) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="text-cutout">
            {/* White = visible */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black = cut out (text area) */}
            <image
              href="/images/LogoStrockImage.webp"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="black"
          mask="url(#text-cutout)"
        />
      </svg>
    </div>
  );
}

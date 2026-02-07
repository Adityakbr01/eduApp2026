"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useShouldLenisRun } from "@/lib/utils/shouldLenisRun";

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const shouldRun = useShouldLenisRun();

  useEffect(() => {
    // 🔥 FORCE UNLOCK SCROLL (IMPORTANT)
    document.body.classList.remove("body-scroll-locked");
    document.body.style.position = "static";
    document.body.style.overflowY = "auto";

    // ❌ Dashboard/Auth pages = NO LENIS
    if (!shouldRun) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [shouldRun]);

  return <>{children}</>;
}

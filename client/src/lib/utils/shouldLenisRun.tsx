"use client";

import { ROUTES_WITHOUT_LENIS } from "@/constants/layout";
import { usePathname } from "next/navigation";

export function useShouldLenisRun() {
  const pathname = usePathname();

  return !ROUTES_WITHOUT_LENIS.some((route) => pathname.startsWith(route));
}

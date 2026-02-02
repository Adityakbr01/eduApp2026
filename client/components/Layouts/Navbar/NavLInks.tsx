"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavLinks } from "./nav.config";

export default function NavLinks() {
  const pathname = usePathname();

  // Check if link is active
  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Define your gradient settings
  const wrapperGradient = "linear-gradient(40deg, rgba(255,255,255,0.3), rgba(255,255,255,0) 50%, rgba(255,255,255,0.3))";
  const innerGradient = "linear-gradient(182deg, #171212 0%, #100B0B 100%)";

  return (
    <div className="hidden min-[850px]:block">
      <div
        className="linkWrapper rounded-lg p-[0.5px]"
        style={{ background: wrapperGradient }}
      >
        <div
          className="links rounded-lg overflow-hidden items-center py-2 px-3 min-[900px]:py-3 min-[900px]:px-5 lg:py-4 lg:px-8 flex gap-3 min-[900px]:gap-5 lg:gap-8 xl:gap-10 tracking-wide text-white/70"
          style={{ background: innerGradient }}
        >
          {mainNavLinks.map((link) => {
            const isActive = isActiveLink(link.href);

            const content = (
              <div className="relative overflow-hidden cursor-pointer group">
                <div className={`transition-transform text-xs min-[900px]:text-sm lg:text-base xl:text-lg duration-300 ease-out group-hover:-translate-y-full whitespace-nowrap ${isActive ? "text-white" : ""}`}>
                  {link.label}
                </div>
                <div className="absolute inset-0 text-xs min-[900px]:text-sm lg:text-base xl:text-lg translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-hover:text-[#e8602e] whitespace-nowrap">
                  {link.label}
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </div>
            );

            if (link.isButton) {
              return (
                <button
                  key={link.label}
                  type="button"
                  className="text-left"
                  aria-label={link.label}
                >
                  {content}
                </button>
              );
            }

            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={link.label} href={link.href || "#"} className="">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

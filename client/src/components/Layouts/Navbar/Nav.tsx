"use client";

import links from "@/constants/links";
import { useAuthStore } from "@/store/auth";
import { Squeeze as Hamburger } from "hamburger-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MobileNav from "./MobileNav";
import NavCTA from "./NavCTA";
import NavLinks from "./NavLInks";
import ProfileDropdown from "./ProfileDropdown";
import RequestCallbackModal from "@/features/RequestCallback";

export default function Nav() {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const { isLoggedIn, hydrated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowNav(currentY < lastScrollY || currentY < 50);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Simple and performant scroll lock - no position changes, no scroll restoration needed
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Lock scroll on html element (more reliable than body)
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Unlock scroll
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        style={{
          height: "var(--navbar-height-mobile)",
        }}
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 md:h-(--navbar-height-desktop) ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } bg-black/50 backdrop-blur-sm`}
      >
        <div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-16 py-3 md:py-4 lg:max-w-8xl h-full">
          {/* Left: Logo */}
          <Link href="/" className="justify-self-start">
            <div className="relative w-40 h-12 md:w-48 md:h-14">
              <Image
                src="https://dfdx9u0psdezh.cloudfront.net/logos/full-logo.webp"
                alt="Logo"
                fill
                priority
                sizes="(max-width: 768px) 160px, 192px"
                className="object-contain cursor-pointer"
              />
            </div>
          </Link>

          {/* Center: Nav Links (Desktop/Laptop only) */}
          <NavLinks onRequestCallback={() => setIsCallbackModalOpen(true)} />

          {/* Right: Sign in / Signup or Profile (Desktop/Laptop only) */}
          <div className="hidden min-[850px]:flex items-center gap-3 justify-self-end">
            {!hydrated ? (
              /* Skeleton placeholder while auth state loads */
              <div className="flex items-center gap-3">
                <div className="w-20 h-10 bg-white/10 rounded-lg animate-pulse" />
                <div className="w-20 h-10 bg-white/10 rounded-lg animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              <ProfileDropdown />
            ) : (
              <div className="hidden min-[850px]:flex items-center gap-3">
                <NavCTA href="/signin" label="Sign In" />
                <NavCTA
                  href={links.AUTH.REGISTER_NEW_STUDENT}
                  label="Sign Up"
                  primary
                />
              </div>
            )}
          </div>

          {/* Hamburger Menu Button (Mobile only) */}
          <div className="min-[850px]:hidden absolute right-4">
            <Hamburger
              toggled={isMobileMenuOpen}
              toggle={setIsMobileMenuOpen}
              size={24}
              color="#fff"
              rounded
              label="Toggle menu"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onRequestCallback={() => {
          closeMobileMenu();
          setIsCallbackModalOpen(true);
        }}
      />

      {/* Request Callback Modal */}
      <RequestCallbackModal
        open={isCallbackModalOpen}
        onOpenChange={setIsCallbackModalOpen}
      />
    </>
  );
}

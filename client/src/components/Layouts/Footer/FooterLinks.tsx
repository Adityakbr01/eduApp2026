"use client";

import FooterLink from "./FooterLink";
import { aboutLinks, companyLinks } from "@/constants/mock_data";

export default function FooterLinks() {
  return (
    <div className="flex md:flex-row flex-col gap-10 md:gap-20 flex-1">
      {/* About */}
      <div className="font-manrope font-normal flex flex-col gap-3 text-lg">
        <h2 className="uppercase font-medium mb-4">About</h2>
        {aboutLinks.map((link) => (
          <FooterLink key={link.name} href={link.href} external={link.external}>
            {link.name}
          </FooterLink>
        ))}
      </div>

      {/* Company */}
      <div className="font-manrope font-normal flex flex-col gap-3 text-lg">
        <h2 className="uppercase font-medium mb-4">Company</h2>
        {companyLinks.map((link) => (
          <FooterLink key={link.name} href={link.href} external={link.external}>
            {link.name}
          </FooterLink>
        ))}
        <button className="hover:text-(--custom-accentColor) font-light text-left w-fit cursor-pointer text-white/60 transition-colors duration-200">
          Feedback
        </button>
      </div>

      {/* Contact */}
      <div className="font-manrope font-normal flex flex-col gap-3 text-lg">
        <h2 className="uppercase font-medium mb-4">Contact</h2>

        {/* Online Phone */}
        <a
          aria-label="Online: 11am - 8pm +91 9993478545"
          className="hover:text-(--custom-accentColor) text-white/60 transition-colors duration-200"
          href="tel:+919993478545"
        >
          <span className="text-white inline-block font-manrope font-light mb-2">
            Online: 11am - 8pm
          </span>
          <span className="inline-block font-manrope font-light">
            {" "}
            +91 9993478545
          </span>
        </a>

        {/* Offline Phone */}
        <a
          aria-label="Offline: 11am - 8pm +91 9691778470"
          className="hover:text-(--custom-accentColor) text-white/60 transition-colors duration-200"
          href="tel:+919691778470"
        >
          <span className="text-white inline-block font-manrope font-light mb-2">
            Offline: 11am - 8pm
          </span>
          <span className="inline-block font-manrope font-light">
            {" "}
            +91 9691778470
          </span>
        </a>

        {/* Email */}
        <a
          aria-label="hello@sheryians.com"
          className="hover:text-(--custom-accentColor) text-white/60 transition-colors duration-200"
          href="mailto:hello@sheryians.com"
        >
          <span className="inline-block font-manrope font-light mb-2">
            hello@sheryians.com
          </span>
        </a>

        {/* Address */}
        <a
          href="https://www.google.com/maps/dir//23-B,+near+Kapoors+Cafe,+Indrapuri+C+sector,+Sector+C,+Indrapuri,+Bhopal,+Madhya+Pradesh+462022"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="23-B, Sector C Indrapuri, Bhopal(MP), 462023 (opens in a new tab)"
          className="hover:text-(--custom-accentColor) text-white/60 transition-colors duration-200"
        >
          <span className="inline-block font-manrope font-light mb-2">
            23-B, Sector C Indrapuri, Bhopal(MP), 462023
          </span>
        </a>
      </div>
    </div>
  );
}

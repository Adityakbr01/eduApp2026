"use client";

import Image from "next/image";
import { socialLinks } from "@/constants/mock_data";

export default function FooterSocials() {
  return (
    <div className="flex w-full lg:w-auto flex-col gap-4">
      <Image
        className="w-40 -ml-12 -mt-14"
        alt="Sheryians Logo"
        src="https://dfdx9u0psdezh.cloudfront.net/logos/c6ea73c88f48c1236e7f94e8.webp"
        width={160}
        height={160}
      />
      <div className="flex items-center gap-8">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            aria-label={`Sheryians Coding School on ${social.name}`}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 ease-in-out hover:opacity-70"
          >
            <Image
              alt={social.name}
              src={social.icon}
              width={24}
              height={24}
              className="size-6 invert object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

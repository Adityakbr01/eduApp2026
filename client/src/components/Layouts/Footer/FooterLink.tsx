"use client";

import Link from "next/link";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  ariaLabel?: string;
}

export default function FooterLink({
  href,
  children,
  external,
  ariaLabel,
}: FooterLinkProps) {
  const className =
    "hover:text-(--custom-accentColor) text-white/60 transition-colors duration-200";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel || `${children} (opens in a new tab)`}
        className={className}
      >
        <span className="inline-block font-manrope font-light whitespace-nowrap mb-2">
          {children}
        </span>
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel || String(children)}
      className={className}
    >
      <span className="inline-block font-manrope font-light whitespace-nowrap mb-2">
        {children}
      </span>
    </Link>
  );
}

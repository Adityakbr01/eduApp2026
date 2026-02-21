"use client";

import { memo } from "react";
import Image from "next/image";

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
}

const PhoneInput = memo(function PhoneInput({
  value,
  onChange,
  hasError,
}: PhoneInputProps) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border rounded-lg transition-all ${
        hasError
          ? "border-red-500/50"
          : "border-white/10 focus-within:border-[#e8602e]/50 focus-within:bg-white/[0.07]"
      }`}
    >
      <Image
        src="https://flagsapi.com/IN/flat/32.png"
        alt="India"
        width={20}
        height={20}
        className="object-cover rounded shrink-0"
      />
      <span className="text-white/50 text-sm sm:text-base font-manrope">
        +91
      </span>
      <input
        name="contact"
        placeholder="Enter your number"
        maxLength={10}
        value={value}
        onChange={onChange}
        type="tel"
        className="flex-1 bg-transparent text-white focus:outline-none text-sm sm:text-base font-manrope placeholder:text-white/30 min-w-0"
      />
    </div>
  );
});

export default PhoneInput;

"use client";

import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnquirySelectProps {
  value: "Online" | "Offline";
  onValueChange: (value: "Online" | "Offline") => void;
  hasError?: boolean;
}

const EnquirySelect = memo(function EnquirySelect({
  value,
  onValueChange,
  hasError,
}: EnquirySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 h-auto bg-white/5 border rounded-lg text-white focus:outline-none text-sm sm:text-base font-manrope focus:ring-0 focus:ring-offset-0 transition-colors ${
          hasError
            ? "border-red-500/50"
            : "border-white/10 focus:border-[#e8602e]/50"
        }`}
      >
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent className="bg-[#171212] border-white/10 rounded-lg">
        <SelectItem
          value="Online"
          className="text-white focus:bg-white/10 focus:text-white font-manrope"
        >
          Online Course (Website)
        </SelectItem>
        <SelectItem
          value="Offline"
          className="text-white focus:bg-white/10 focus:text-white font-manrope"
        >
          Offline Course
        </SelectItem>
      </SelectContent>
    </Select>
  );
});

export default EnquirySelect;

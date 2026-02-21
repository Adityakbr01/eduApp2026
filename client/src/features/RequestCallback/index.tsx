"use client";

import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { CallbackForm } from "./components";
import { useCallbackForm } from "./hooks/useCallbackForm";
import type { RequestCallbackModalProps } from "./types";

function RequestCallbackModal({
  open,
  onOpenChange,
}: RequestCallbackModalProps) {
  const { handleClose } = useCallbackForm(onOpenChange);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] sm:w-[85vw] md:w-[80vw] lg:w-[80vw] xl:w-[35vw] max-w-125 max-h-[90vh] overflow-y-auto overflow-x-hidden bg-linear-to-b from-[#171212] to-[#0a0707] text-white border border-[#4E4A48] rounded-2xl p-0 gap-0 [&>button]:hidden">
        {/* Decorative glow */}
        <div className="absolute animate-pulse -top-32 -right-32 w-64 h-64 bg-[#e8602e]/15 rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="absolute md:block hidden animate-pulse -bottom-32 -left-32 w-64 h-64 bg-[#e8602e]/10 rounded-full blur-3xl pointer-events-none opacity-50" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute cursor-pointer top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-colors z-10"
          aria-label="Close"
        >
          <X className="size-4 sm:size-5 text-white/70" />
        </button>

        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 py-6 sm:py-8 px-4 sm:px-6 md:px-8 relative">
          <X
            onClick={handleClose}
            className="close-model absolute top-3 md:top-6 md:right-6 cursor-pointer right-3 w-6 h-6"
          />

          {/* Header */}
          <DialogHeader className="flex flex-col items-center justify-center text-center w-full space-y-2 sm:space-y-3">
            <DialogTitle className="font-machina font-medium text-xl sm:text-2xl md:text-[1.8rem] text-white tracking-wide">
              Request a Callback
            </DialogTitle>
            <DialogDescription className="font-manrope font-normal text-white/50 text-sm sm:text-base leading-relaxed max-w-[90%]">
              Fill the form below to request a callback from our team.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <CallbackForm onOpenChange={onOpenChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RequestCallbackModal;

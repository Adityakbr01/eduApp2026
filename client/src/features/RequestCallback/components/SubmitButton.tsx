"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
    isSubmitting: boolean;
}

const SubmitButton = memo(function SubmitButton({ isSubmitting }: SubmitButtonProps) {
    return (
        <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 sm:py-3.5 h-auto rounded-xl font-manrope font-semibold text-sm sm:text-base mt-2 transition-all bg-linear-to-r from-[#E36A34] via-[#C55321] to-[#8A3D1A] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-white border-0 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#e8602e]/20"
        >
            {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Submitting...
                </span>
            ) : (
                "Submit Request"
            )}
        </Button>
    );
});

export default SubmitButton;

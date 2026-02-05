"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
    label: string;
    error?: string;
    optional?: boolean;
    children: React.ReactNode;
}

const FormField = memo(function FormField({ label, error, optional, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5 sm:gap-2">
            <Label className="text-white/60 text-sm sm:text-base font-manrope font-normal">
                {label}
                {optional && <span className="text-white/30 ml-1">(optional)</span>}
            </Label>
            {children}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.span
                        key={error}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="text-red-400 text-xs sm:text-sm font-manrope"
                    >
                        {error}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
});

export default FormField;

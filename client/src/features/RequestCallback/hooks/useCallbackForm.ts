"use client";

import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

import { submitCallbackRequest } from "../api";
import {
    callbackFormSchema,
    initialFormData,
    type FormState,
    type FormErrors,
} from "../types";

export function useCallbackForm(onOpenChange: (open: boolean) => void) {
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) =>
                prev[name as keyof FormErrors] ? { ...prev, [name]: undefined } : prev,
            );
        },
        [],
    );

    const handleSelectChange = useCallback((value: "Online" | "Offline") => {
        setFormData((prev) => ({ ...prev, enquiryFor: value }));
        setErrors((prev) =>
            prev.enquiryFor ? { ...prev, enquiryFor: undefined } : prev,
        );
    }, []);

    const validateForm = useCallback((): boolean => {
        const result = callbackFormSchema.safeParse(formData);

        if (result.success) {
            setErrors({});
            return true;
        }

        const newErrors: FormErrors = {};
        result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof FormErrors;
            newErrors[field] = issue.message;
        });
        setErrors(newErrors);
        return false;
    }, [formData]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!validateForm()) {
                toast.error("Please fix the errors in the form");
                return;
            }

            setIsSubmitting(true);

            try {
                const response = await submitCallbackRequest(formData);

                if (response.success) {
                    toast.success(response.message);
                    setFormData(initialFormData);
                    setErrors({});
                    onOpenChange(false);
                }
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Something went wrong",
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, onOpenChange],
    );

    const handleClose = useCallback(() => {
        setErrors({});
        onOpenChange(false);
    }, [onOpenChange]);

    const inputClassName = useMemo(
        () => (hasError: boolean) =>
            `w-full px-3 sm:px-4 py-2.5 sm:py-3 h-auto bg-white/5 border rounded-lg text-white placeholder:text-white/30 text-sm sm:text-base font-manrope focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors ${hasError
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10 focus:border-[#e8602e]/50 focus:bg-white/[0.07]"
            }`,
        [],
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleChange,
        handleSelectChange,
        handleSubmit,
        handleClose,
        inputClassName,
    };
}

"use client";

import { useState, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import FormField from "./FormField";
import PhoneInput from "./PhoneInput";
import SubmitButton from "./SubmitButton";
import { callbackFormSchema, FormErrors } from "../../../validators/callbackForm.schema";
import { submitCallbackRequest } from "./callbackApi";

interface RequestCallbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormState {
    name: string;
    contact: string;
    dateTime: string;
    enquiryFor: "Online" | "Offline";
    notes: string;
}

const initialFormData: FormState = {
    name: "",
    contact: "",
    dateTime: "",
    enquiryFor: "Online",
    notes: "",
};

function RequestCallbackModal({ open, onOpenChange }: RequestCallbackModalProps) {
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => (prev[name as keyof FormErrors] ? { ...prev, [name]: undefined } : prev));
        },
        []
    );

    const handleSelectChange = useCallback((value: "Online" | "Offline") => {
        setFormData((prev) => ({ ...prev, enquiryFor: value }));
        setErrors((prev) => (prev.enquiryFor ? { ...prev, enquiryFor: undefined } : prev));
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
                toast.error(error instanceof Error ? error.message : "Something went wrong");
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, onOpenChange]
    );

    const handleClose = useCallback(() => {
        setErrors({});
        onOpenChange(false);
    }, [onOpenChange]);

    // Memoize input class names
    const inputClassName = useMemo(
        () => (hasError: boolean) =>
            `w-full px-3 sm:px-4 py-2.5 sm:py-3 h-auto bg-white/5 border rounded-lg text-white placeholder:text-white/30 text-sm sm:text-base font-manrope focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors ${
                hasError
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-[#e8602e]/50 focus:bg-white/[0.07]"
            }`,
        []
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[90%] sm:w-[85vw] md:w-[80vw] lg:w-[80vw] xl:w-[35vw] max-w-125 max-h-[90vh] overflow-y-auto bg-linear-to-b from-[#171212] to-[#0a0707] text-white border border-[#4E4A48] rounded-2xl p-0 gap-0 [&>button]:hidden">
                {/* Decorative glow - using CSS animation instead of animate-pulse */}
                <div className="absolute animate-pulse -top-32 -right-32 w-64 h-64 bg-[#e8602e]/15 rounded-full blur-3xl pointer-events-none opacity-60" />
                <div className="absolute animate-pulse -bottom-32 -left-32 w-64 h-64 bg-[#e8602e]/10 rounded-full blur-3xl pointer-events-none opacity-50" />

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
                    <X onClick={handleClose} className="close-model absolute top-3 md:top-6 md:right-6 cursor-pointer right-3 w-6 h-6 " />
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
                    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:gap-4">
                        {/* Name */}
                        <FormField label="Name" error={errors.name}>
                            <Input
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputClassName(!!errors.name)}
                            />
                        </FormField>

                        {/* Phone */}
                        <FormField label="Phone Number" error={errors.contact}>
                            <PhoneInput
                                value={formData.contact}
                                onChange={handleChange}
                                hasError={!!errors.contact}
                            />
                        </FormField>

                        {/* Date & Time */}
                        <FormField label="Preferred Date & Time" error={errors.dateTime}>
                            <input
                                name="dateTime"
                                type="datetime-local"
                                value={formData.dateTime}
                                onChange={handleChange}
                                className={`${inputClassName(!!errors.dateTime)} datetime-input`}
                            />
                        </FormField>

                        {/* Enquiry For */}
                        <FormField label="Enquiry For" error={errors.enquiryFor}>
                            <Select value={formData.enquiryFor} onValueChange={handleSelectChange}>
                                <SelectTrigger
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 h-auto bg-white/5 border rounded-lg text-white focus:outline-none text-sm sm:text-base font-manrope focus:ring-0 focus:ring-offset-0 transition-colors ${
                                        errors.enquiryFor
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
                        </FormField>

                        {/* Notes */}
                        <FormField label="Notes" error={errors.notes} optional>
                            <Textarea
                                name="notes"
                                rows={2}
                                value={formData.notes}
                                onChange={handleChange}
                                className={`${inputClassName(!!errors.notes)} resize-none`}
                                placeholder="Any additional notes..."
                            />
                        </FormField>

                        {/* Submit Button */}
                        <SubmitButton isSubmitting={isSubmitting} />
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default RequestCallbackModal;

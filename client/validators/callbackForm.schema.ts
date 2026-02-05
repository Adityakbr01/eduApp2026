import { z } from "zod";

export const callbackFormSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),
    contact: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    dateTime: z.string().min(1, "Please select a date and time"),
    enquiryFor: z.enum(["Online", "Offline"], {
        message: "Please select an enquiry type",
    }),
    notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export type CallbackFormData = z.infer<typeof callbackFormSchema>;

export interface FormErrors {
    name?: string;
    contact?: string;
    dateTime?: string;
    enquiryFor?: string;
    notes?: string;
}

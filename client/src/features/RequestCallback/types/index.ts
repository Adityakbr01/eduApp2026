export { callbackFormSchema } from "@/validators/callbackForm.schema";
export type { CallbackFormData, FormErrors } from "@/validators/callbackForm.schema";

export interface RequestCallbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FormState {
    name: string;
    contact: string;
    dateTime: string;
    enquiryFor: "Online" | "Offline";
    notes: string;
}

export const initialFormData: FormState = {
    name: "",
    contact: "",
    dateTime: "",
    enquiryFor: "Online",
    notes: "",
};

import { EmailTone } from "@/services/ai";

export const  EMailfromName = "EduApp";
export const EMailfromNamefromEmail = "noreply@eduapp.com";

export const TONES: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
  { value: "casual", label: "Casual" },
];
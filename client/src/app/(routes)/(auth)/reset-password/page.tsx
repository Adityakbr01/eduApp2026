import ResetPasswordPage from "@/features/auth/Pages/resetPasswordPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | EduApp",
  description:
    "Reset your EduApp account password to regain access to your dashboard and courses.",
};

export default function Page() {
  return <ResetPasswordPage />;
}

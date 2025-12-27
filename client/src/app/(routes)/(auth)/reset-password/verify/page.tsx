import ResetPasswordVerifyPage from "@/components/pages/Auth/ResetPasswordVerifyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify OTP | EduApp",
    description: "Enter the OTP sent to your email and set a new password.",
};

// ✅ FIXED: mark async & unwrap the searchParams Promise
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const email = typeof params.email === "string" ? params.email : "";
    return <ResetPasswordVerifyPage initialEmail={email} />;
}

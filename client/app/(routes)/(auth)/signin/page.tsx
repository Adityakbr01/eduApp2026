
import SignInPage from "@/components/pages/signInPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In | EduApp",
    description: "Sign in to your EduApp account to access your dashboard and courses.",
};

export default function Page() {
    return <SignInPage />;
}
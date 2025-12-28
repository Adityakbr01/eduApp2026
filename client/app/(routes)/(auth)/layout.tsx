"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { hydrated, isLoggedIn } = useAuthStore();

    // ⏳ Wait for zustand hydration
    useEffect(() => {
        if (!hydrated) return;

        if (isLoggedIn) {
            router.replace("/");
        }
    }, [hydrated, isLoggedIn, router]);

    if (!hydrated) return null;


    // If logged in, layout will redirect, so don't flash auth UI
    if (isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}

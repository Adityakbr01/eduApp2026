"use client";

import { ThemeProvider } from "@/Providers/theme-provider";
import { TanStackProvider } from "@/Providers/TanStackProvider";
import MainProvider from "@/Providers/MainProvider";
import LenisProvider from "@/Providers/LenisProvider";
import PageTransition from "@/components/PageTransition";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <TanStackProvider>
                <LenisProvider>
                    <MainProvider> <PageTransition>{children}</PageTransition></MainProvider>
                </LenisProvider>
            </TanStackProvider>
        </ThemeProvider>
    );
}

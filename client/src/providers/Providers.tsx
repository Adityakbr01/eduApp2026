"use client";

import LenisProvider from "@/providers/LenisProvider";
import MainProvider from "@/providers/MainProvider";
import { TanStackProvider } from "@/providers/TanStackProvider";
import { ThemeProvider } from "@/providers/theme-provider";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <TanStackProvider>
                <LenisProvider>
                    <MainProvider> {children}</MainProvider>
                </LenisProvider>
            </TanStackProvider>
        </ThemeProvider>
    );
}

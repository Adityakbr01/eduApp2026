"use client";

import LenisProvider from "@/Providers/LenisProvider";
import MainProvider from "@/Providers/MainProvider";
import { TanStackProvider } from "@/Providers/TanStackProvider";
import { ThemeProvider } from "@/Providers/theme-provider";

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

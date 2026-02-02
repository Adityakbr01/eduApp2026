"use client";

import { ThemeProvider } from "@/Providers/theme-provider";
import { TanStackProvider } from "@/Providers/TanStackProvider";
import MainProvider from "@/Providers/MainProvider";
import LenisProvider from "@/Providers/LenisProvider";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <TanStackProvider>
                <LenisProvider>
                    <MainProvider>{children}</MainProvider>
                </LenisProvider>
            </TanStackProvider>
        </ThemeProvider>
    );
}

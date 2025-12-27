"use client";

import { ThemeProvider } from "@/Providers/theme-provider";
import { TanStackProvider } from "@/Providers/TanStackProvider";
import MainProvider from "@/Providers/MainProvider";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <TanStackProvider>
                <MainProvider>{children}</MainProvider>
            </TanStackProvider>
        </ThemeProvider>
    );
}

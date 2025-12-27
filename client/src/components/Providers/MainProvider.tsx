"use client";
import { useInitUser } from "@/services/auth/useInitUser";
import React from "react";
import ReactToast from "./ReactToast";


function MainProvider({ children }: { children: React.ReactNode }) {
    useInitUser();
    return (
        <main className="max-w-8xl mx-auto w-full h-full">
            {children}
            <ReactToast />
        </main>
    );
}

export default MainProvider;
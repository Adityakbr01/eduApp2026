"use client";
import { useInitUser } from "@/services/auth/useInitUser";
import { usePathname } from "next/navigation";
import React from "react";
import ReactToast from "./ReactToast";
import Nav from "@/components/Layouts/Navbar/Nav";
import { shouldHideNavbar } from "@/constants/layout";

function MainProvider({ children }: { children: React.ReactNode }) {
    
    useInitUser();
    const pathname = usePathname();
    
    // Dashboard pages have their own navigation, hide main navbar
    const hideNavbar = shouldHideNavbar(pathname);
    
    return (
        <main className="max-w-8xl mx-auto w-full h-full">
            {!hideNavbar && <Nav />}
            <div className={hideNavbar ? "dashboard-layout" : "main-content-with-navbar"}>
                {children}
            </div>
            <ReactToast />
        </main>
    );
}

export default MainProvider;
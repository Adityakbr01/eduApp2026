"use client";

import Link from "next/link";
import { useRef } from "react";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import NewSupportForm from "@/components/Form/auth/signUp-forms/NewSupportForm";
import ROUTES from "@/lib/constants/routes";


function SupportSignUpPage() {
    //Animation
    const formWrapperRef = useRef<HTMLDivElement>(null);
    const smoke1Ref = useRef(null);
    const smoke2Ref = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(formWrapperRef.current, {
            opacity: 0,
            y: 40,
            scale: 0.95,
            duration: 1,
            ease: "power3.out",
        });

        tl.from(
            smoke1Ref.current,
            {
                opacity: 0,
                x: 80,
                duration: 0.5,
                ease: "linear",
            },
            "smokes" // label
        );

        tl.from(
            smoke2Ref.current,
            {
                opacity: 0,
                x: -80,
                duration: 0.5,
                ease: "linear",
            },
            "smokes"
        );
    }, []);

    return (
        <div className="w-full relative z-20 overflow-hidden  min-h-screen flex items-center justify-center p-0">
            <div ref={formWrapperRef} className="w-full h-full max-w-md md:rounded-2xl overflow-hidden shadow-xs md:border-y">
                <div className="p-5 space-y-4 relative">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                            Sign Up
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href={ROUTES.AUTH.LOGIN} className="text-blue-600 font-semibold">
                                Sign In
                            </Link>
                        </p>
                    </div>
                    <NewSupportForm />
                </div>
            </div>
            <div ref={smoke1Ref} className="fluid-container absolute z-10 bg-[#1b80ed75] h-[90vh] w-[90vh] rounded-full -top-[50vh] -right-[90vh] blur-[40vh]">
            </div>
            <div ref={smoke2Ref} className="fluid-container absolute z-10 bg-[#a1b6cd51] h-[90vh] w-[90vh] rounded-full -bottom-[50vh] -left-[90vh] blur-[40vh]">
            </div>
        </div>

    );
}

export default SupportSignUpPage;

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import ResetPasswordVerifyForm from "@/components/form/auth/reset-password-form/ResetPasswordVerifyForm";

function ResetPasswordVerifyPage({ initialEmail }: { initialEmail: string }) {
    //Animation
    const formWrapperRef = useRef<HTMLDivElement>(null);
    const smoke1Ref = useRef(null);
    const smoke2Ref = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(formWrapperRef.current, {
            opacity: 0,
            y: 30,
            scale: 0.96,
            filter: "blur(10px)",
            duration: 0.5,
            ease: "power2.out",
        });

        tl.from(
            [smoke1Ref.current, smoke2Ref.current],
            {
                opacity: 0,
                scale: 0.8,
                duration: 1.2,
                ease: "sine.out",
                stagger: 0.2,
            },
            "-=0.5"
        );
    }, []);

    return (
        <div className="w-full relative z-20 overflow-hidden  min-h-screen flex items-center justify-center p-0">
            <div ref={formWrapperRef} className="w-full h-full max-w-md md:rounded-2xl overflow-hidden shadow-xs md:border-y">
                <div className="p-5 space-y-4 relative">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                            Verify & Reset
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter the OTP code we sent to your email and set your new password.
                        </p>
                    </div>
                    <ResetPasswordVerifyForm initialEmail={initialEmail} />
                </div>
            </div>
            <div ref={smoke1Ref} className="fluid-container absolute z-10 bg-[#1b80ed6c] h-[90vh] w-[90vh] rounded-full -top-[50vh] -right-[90vh] blur-[40vh]">
            </div>
            <div ref={smoke2Ref} className="fluid-container absolute z-10 bg-[#a1b6cd51] h-[90vh] w-[90vh] rounded-full -bottom-[50vh] -left-[90vh] blur-[40vh]">
            </div>
        </div>
    );
}

export default ResetPasswordVerifyPage;

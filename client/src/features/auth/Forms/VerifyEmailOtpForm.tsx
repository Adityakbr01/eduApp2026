"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";

import { secureLocalStorage } from "@/lib/utils/encryption";

import { registerVerifyOtpSchema, type RegisterVerifyOtpInput } from "@/validators/auth.schema";
import { useSendRegisterOtp, useVerifyRegisterOtp } from "@/services/auth/mutations";
import { handleMutationError } from "@/services/common/mutation-error-handler";
import links from "@/constants/links";
import Auth from "@/constants/auth";

function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!name || name.length < 3) return email;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

export default function VerifyEmailOtpForm() {
    const router = useRouter();
    const verifyOtp = useVerifyRegisterOtp();
    const resendOtp = useSendRegisterOtp();
    const intervalRef = useRef<number | null>(null);

    const form = useForm<RegisterVerifyOtpInput>({
        resolver: zodResolver(registerVerifyOtpSchema),
        defaultValues: { email: "", otp: "" },
        mode: "onBlur",
    });

    const { setValue, getValues, setError } = form;

    // Load email from local storage
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailFromQuery = searchParams.get("email");

        if (emailFromQuery) {
            setValue("email", emailFromQuery);
        }

        // Start OTP cooldown
        let cooldown = Auth.SIGNUP_OTP_COOLDOWN;
        intervalRef.current = window.setInterval(() => {
            cooldown--;
            if (cooldown <= 0 && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 1000) as unknown as number;

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [searchParams, setValue]);


    const handleVerify = () => {
        verifyOtp.mutate(getValues(), {
            onError: (error) => handleMutationError<RegisterVerifyOtpInput>(error, setError),
            onSuccess: () => {

                router.push(links.AUTH.LOGIN);
            },
        });
    };

    const handleResend = () => {
        resendOtp.mutate({ email: getValues("email") }, { onSuccess: () => { } });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerify)} className="max-w-sm w-full space-y-6 p-6 rounded-xl mx-auto">
                <h1 className="text-2xl font-semibold">Verify OTP</h1>
                <p className="text-sm text-muted-foreground">
                    OTP sent to <span className="font-semibold">{maskEmail(getValues("email"))}</span>
                </p>

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Enter OTP *</FormLabel>
                            <FormControl >
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input {...field} type="number" inputMode="numeric" maxLength={Number(Auth.SIGNUP_OTP_LENGTH)} className="h-11 text-center tracking-widest text-lg pl-2" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={verifyOtp.isPending} className="w-full h-11">
                    {verifyOtp.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify OTP"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        Didn&apos;t receive OTP?
                    </p>
                    <button type="button" onClick={handleResend} disabled={resendOtp.isPending} className="text-blue-600 font-medium disabled:text-gray-400">
                        {resendOtp.isPending ? "Sending..." : "Resend"}
                    </button>
                </div>
            </form>
        </Form>
    );
}

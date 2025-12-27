"use client";

import {
    resetPasswordVerifySchema,
    type ResetPasswordVerifyInput,
} from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";

import ROUTES from "@/lib/CONSTANTS/ROUTES";
import { useSendResetPasswordOtp, useVerifyResetPasswordOtp } from "@/services/auth/mutations";
import { handleMutationError } from "@/services/common/mutation-error-handler";

type ResetPasswordVerifyForm = ResetPasswordVerifyInput;

export default function ResetPasswordVerifyForm({
    initialEmail = "",
}: {
    initialEmail?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const router = useRouter();
    const verifyOtpMutation = useVerifyResetPasswordOtp();
    const sendOtpMutation = useSendResetPasswordOtp();

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);


    const form = useForm<ResetPasswordVerifyForm>({
        resolver: zodResolver(resetPasswordVerifySchema),
        defaultValues: {
            email: initialEmail,
            otp: "",
            newPassword: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: ResetPasswordVerifyForm) => {
        await verifyOtpMutation.mutateAsync(data, {
            onError: (error) => {
                handleMutationError<ResetPasswordVerifyForm>(error, form.setError);
            },
            onSuccess: () => {
                router.push(ROUTES.AUTH.LOGIN);
            }
        });
    };


    const handleResendOtp = async () => {
        if (!initialEmail) {
            console.error("❌ No email provided");
            return;
        }

        await sendOtpMutation.mutateAsync({ email: initialEmail }, {
            onError: (error) => {
                handleMutationError<ResetPasswordVerifyForm>(error, form.setError);
            },
        });
        setCooldown(60);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Email Address *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="user1@gmail.com"
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10"
                                        readOnly
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center mb-2">
                                <FormLabel className="text-sm font-medium">OTP Code *</FormLabel>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={cooldown > 0 || sendOtpMutation.isPending}
                                    className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                                >
                                    {sendOtpMutation.isPending
                                        ? "Sending..."
                                        : cooldown > 0
                                            ? `Resend in ${cooldown}s`
                                            : "Resend OTP"}
                                </button>
                            </div>
                            <FormControl>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="812775"
                                        maxLength={6}
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10 tracking-widest"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">New Password *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={verifyOtpMutation.isPending}
                    className="w-full h-11 font-semibold rounded-lg"
                >
                    {verifyOtpMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Resetting Password...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <a
                        href={ROUTES.AUTH.LOGIN}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </a>
                </div>
            </form>
        </Form>
    );
}

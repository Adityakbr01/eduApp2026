"use client";

import {
    loginSchema,
    type SigninFormInput,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import links from "@/lib/constants/links";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { authMutations } from "@/services/auth/mutations";
import { handleMutationError } from "@/services/common/mutation-error-handler";

type SigninForm = SigninFormInput;

export default function SigninForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const loginMutation = authMutations.useLogin();

    const form = useForm<SigninForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onBlur",
    });

    // ✅ On mount: check for saved credentials
    useEffect(() => {
        const savedCredentials = secureLocalStorage.getItem<SigninForm>("userCredentials");
        const rememberFlag = secureLocalStorage.getItem<boolean>("rememberMe");

        if (savedCredentials && rememberFlag) {
            // async microtask avoids synchronous render
            setTimeout(() => {
                form.setValue("email", savedCredentials.email);
                form.setValue("password", savedCredentials.password);
                setRememberMe(true);
            }, 0);
        }
    }, [form]);


    const onSubmit = async (data: SigninForm) => {
        await loginMutation.mutateAsync(data, {
            onError: (response) => {
                handleMutationError<SigninForm>(response, form.setError);
            }
        });
        if (rememberMe) {
            secureLocalStorage.setItem("userCredentials", data);
            secureLocalStorage.setItem("rememberMe", true);
        } else {
            secureLocalStorage.removeItem("userCredentials");
            secureLocalStorage.removeItem("rememberMe");
        }
        router.push(links.HOME);
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
                                        placeholder="student1@gmail.com"
                                        {...field}
                                        className="h-11 rounded-lg text-sm pl-10"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Password *</FormLabel>
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

                {/* ✅ Remember Me Checkbox */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium leading-none cursor-pointer"
                        >
                            Remember me for 30 days
                        </label>
                    </div>
                    {/* Reset password */}
                    <div className="text-right">
                        <a
                            href={links.AUTH.RESET_PASSWORD}
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                </div>



                <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-11 font-semibold rounded-lg"
                >
                    {loginMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Signing In...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>
        </Form>
    );
}

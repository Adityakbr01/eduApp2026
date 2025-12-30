"use client";

import {
    registerSchema,
    type RegisterSchemaInput,
    ROLES
} from "@/validators/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import links from "@/constants/links";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { useRegister } from "@/services/auth/mutations";
import { handleMutationError } from "@/services/common/mutation-error-handler";
import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, User } from "lucide-react";

type RegisterFormData = RegisterSchemaInput;

function NewStudentForm() {
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const savedFinal = typeof window !== "undefined"
        ? secureLocalStorage.getItem<RegisterFormData>("registerData", null)
        : null;

    const savedDraft = typeof window !== "undefined"
        ? secureLocalStorage.getItem<Partial<RegisterFormData>>("registerFormData", null)
        : null;

    const restored = (savedFinal ?? savedDraft) as RegisterFormData | null;
    const initialValues: RegisterFormData = restored ?? {
        role: ROLES.STUDENT,
        name: "",
        email: "",
        password: "",
        phone: undefined,
        address: undefined,
    };

    const register = useRegister();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    });

    // Ensure form picks up restored values
    useEffect(() => {
        form.reset(initialValues);
        secureLocalStorage.setItem("authStep", "1");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    useEffect(() => {
        const subscription = form.watch((value) => {
            secureLocalStorage.setItem("registerFormData", value);
        });

        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: RegisterFormData) => {
        secureLocalStorage.setItem("registerData", data);
        secureLocalStorage.setItem("authStep", "2");
        await register.mutateAsync(data, {
            onSuccess: () => {
                router.push(links.AUTH.VERIFY_OTP);
            },
            onError: (error: unknown) => {
                handleMutationError<RegisterFormData>(error as AxiosError, form.setError);
                if (error instanceof AxiosError && error.response) {
                    // Keep user on step 1 if there are validation errors
                    secureLocalStorage.setItem("authStep", "1");
                    if (error.status === 409) {
                        router.push(links.AUTH.LOGIN);
                    }
                }
            }
        });
    };

    return (

        <>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="John Doe"
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Email Address *
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
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
                                            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs text-muted-foreground">
                                    Min 6 characters including uppercase, lowercase and numbers
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="tel"
                                            placeholder="9876543210"
                                            {...field}
                                            value={field.value || ""}
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
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="123 Main Street, City"
                                            {...field}
                                            value={field.value || ""}
                                            className="h-11 rounded-lg text-sm pl-10"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={register.isPending}
                        className="w-full h-11 font-semibold rounded-lg"
                    >
                        {register.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sign Up"}
                    </Button>
                </form>
            </Form>

        </>

    );
}

export default NewStudentForm;
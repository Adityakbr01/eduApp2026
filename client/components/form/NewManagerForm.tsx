"use client";

import {
    registerSchema,
    type RegisterSchemaInput,
    ROLES,
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
import { Building2, Eye, EyeOff, Loader2, Lock, Mail, MapPin, Phone, User, Users } from "lucide-react";


import { secureLocalStorage } from "@/lib/utils/encryption";
import { authMutations } from "@/services/auth/mutations";
import { AxiosError } from "axios";
import { handleMutationError } from "@/services/common/mutation-error-handler";
import links from "@/constants/links";

type RegisterFormData = RegisterSchemaInput;

export default function NewManagerForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<number>(1);

    const router = useRouter();
    const registerMutation = authMutations.useRegister();

    // ---- restore local data safely ----
    const savedFinal =
        typeof window !== "undefined"
            ? secureLocalStorage.getItem<RegisterFormData>("registerData", null)
            : null;

    const savedDraft =
        typeof window !== "undefined"
            ? secureLocalStorage.getItem<Partial<RegisterFormData>>(
                "registerFormData",
                null
            )
            : null;

    const savedAuthStep =
        typeof window !== "undefined"
            ? secureLocalStorage.getItem<string>("authStep", "1")
            : "1";

    const restored = (savedFinal ?? savedDraft) as RegisterFormData | null;

    // Only restore if the saved data is for MANAGER role
    const isManagerData = restored?.role === ROLES.MANAGER;

    const initialValues: RegisterFormData =
        (isManagerData ? restored : null) ?? {
            role: ROLES.MANAGER,
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            managerProfile: {
                department: "",
                teamSize: 0,
            },
        };

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    });

    // restore step & sync saved values
    useEffect(() => {

        // If we had wrong role data, clear it
        if (!isManagerData && restored) {
            secureLocalStorage.removeItem("registerData");
            secureLocalStorage.removeItem("registerFormData");
        }

        form.reset(initialValues);
        setStep(Number(savedAuthStep) || 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // auto-save as draft
    useEffect(() => {
        const subscription = form.watch((value) => {
            secureLocalStorage.setItem("registerFormData", value);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // ---- step handlers ----
    const goToStep2 = async () => {
        const ok = await form.trigger(["name", "email", "password", "phone", "address"]);
        if (ok) {
            // Save only step1 data (no managerProfile yet)
            const formData = form.getValues();
            secureLocalStorage.setItem("registerFormData", {
                role: ROLES.MANAGER,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
            });
            secureLocalStorage.setItem("authStep", "2");

            // Reset form for step2 with proper managerProfile defaults
            form.reset({
                role: ROLES.MANAGER,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                managerProfile: {
                    department: "",
                    teamSize: 0,
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            setStep(2);
        } else {
            console.log("❌ Step 1 validation failed");
        }
    };

    const goToStep1 = () => {
        secureLocalStorage.setItem("authStep", "1");
        setStep(1);
    };

    // ---- submit handler ----
    const onSubmit = async () => {
        // Validate ALL fields before submission
        const isValid = await form.trigger();

        if (!isValid) {
            return;
        }
        const formValues = form.getValues();
        secureLocalStorage.setItem("registerData", formValues);
        secureLocalStorage.setItem("authStep", "2");

        await registerMutation.mutateAsync(formValues, {
            onSuccess: () => {
                secureLocalStorage.removeItem("registerFormData");
                secureLocalStorage.removeItem("registerData");
                secureLocalStorage.removeItem("authStep");
                router.push(links.HOME);
            }, onError: (error) => {
                handleMutationError<RegisterFormData>(error as AxiosError, form.setError);
                if (error instanceof AxiosError && error.response) {
                    if (error.response.status === 409) {
                        router.push(links.AUTH.LOGIN);
                    }
                }
            }
        });
    };

    // ----------------------------------------------------------
    // Render
    // ----------------------------------------------------------
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {step === 1 ? (
                    <>
                        {/* Step 1 — Basic Info */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="John Doe" {...field} className="pl-10" />
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
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="email" placeholder="john@example.com" {...field} className="pl-10" />
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
                                    <FormLabel>Password *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
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
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="tel" placeholder="9876543210" {...field} className="pl-10" />
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
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="123 Main Street, City" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="button"
                            onClick={goToStep2}
                            className="w-full h-11 font-semibold rounded-lg"
                        >
                            Next
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Hidden fields to preserve step 1 data */}
                        <input type="hidden" {...form.register("role")} />
                        <input type="hidden" {...form.register("name")} />
                        <input type="hidden" {...form.register("email")} />
                        <input type="hidden" {...form.register("password")} />
                        <input type="hidden" {...form.register("phone")} />
                        <input type="hidden" {...form.register("address")} />

                        {/* Step 2 — Manager Profile */}
                        <div className="text-sm font-medium text-muted-foreground">
                            Manager Profile
                        </div>

                        <FormField
                            control={form.control}
                            name="managerProfile.department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Engineering, Sales, Marketing" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="managerProfile.teamSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Size *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="5"
                                                value={Number(field.value) || 0}
                                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {

                                    goToStep1();
                                }}
                                className="h-11 flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="h-11 flex-1 font-semibold"
                                onClick={() => console.log("🔘 Submit button clicked")}
                            >
                                {registerMutation.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Finish & Sign Up"
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    );
}

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
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone, MapPin, FileText, Briefcase, Award } from "lucide-react";

import ROUTES from "@/lib/constants/links";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { authMutations } from "@/services/auth/mutations";
import { AxiosError } from "axios";
import { handleMutationError } from "@/services/common/mutation-error-handler";

type RegisterFormData = RegisterSchemaInput;

export default function NewInstructorForm() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [expertiseInput, setExpertiseInput] = useState("");

    const router = useRouter();
    const savedFinal = typeof window !== "undefined"
        ? secureLocalStorage.getItem<RegisterFormData>("registerData", null)
        : null;

    const savedDraft = typeof window !== "undefined"
        ? secureLocalStorage.getItem<Partial<RegisterFormData>>("registerFormData", null)
        : null;

    // Only restore if the saved data is for INSTRUCTOR role
    const restored = (savedFinal ?? savedDraft) as RegisterFormData | null;
    const isInstructorData = restored?.role === ROLES.INSTRUCTOR;

    const initialValues: RegisterFormData = (isInstructorData ? restored : null) ?? {
        role: ROLES.INSTRUCTOR,
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        instructorProfile: {
            bio: "",
            expertise: [],
            experience: 0,
        },
    };

    const register = authMutations.useRegister();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: initialValues,
        mode: "onBlur",
    });

    // Ensure form picks up restored values
    useEffect(() => {

        // If we had wrong role data, clear it
        if (!isInstructorData && restored) {
            secureLocalStorage.removeItem("registerData");
            secureLocalStorage.removeItem("registerFormData");
        }

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

    const onSubmit = async () => {
        const isValid = await form.trigger();
        if (!isValid) {
            return;
        }
        const formValues = form.getValues();
        secureLocalStorage.setItem("registerData", formValues);
        secureLocalStorage.setItem("authStep", "2");

        await register.mutateAsync(formValues, {
            onSuccess: () => {
                secureLocalStorage.removeItem("registerFormData");
                secureLocalStorage.removeItem("registerData");
                secureLocalStorage.removeItem("authStep");
                router.push(ROUTES.HOME);
            },
            onError: (error) => {
                handleMutationError(error, form.setError);
                if (error instanceof AxiosError && error.response) {
                    if (error.response.status === 409) {
                        router.push(ROUTES.AUTH.LOGIN);
                    }
                }
            }
        });
    };

    const goToStep2 = async () => {
        const ok = await form.trigger(["name", "email", "password", "phone", "address"]);
        if (ok) {
            secureLocalStorage.setItem("authStep", "2");
            setStep(2);
        }
    };

    const goToStep1 = () => {
        secureLocalStorage.setItem("authStep", "1");
        setStep(1);
    };


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
                                                maxLength={10}
                                                pattern="[0-9]*"
                                                inputMode="numeric"
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
                        />                        <Button
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

                        {/* Step 2 — Instructor Profile */}
                        <div className="text-sm font-medium text-muted-foreground">
                            Instructor Profile
                        </div>

                        <FormField
                            control={form.control}
                            name="instructorProfile.bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Short bio about you" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructorProfile.expertise"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Expertise (comma separated) *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="React, Node, Algorithms"
                                                value={expertiseInput}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setExpertiseInput(value);
                                                    const expertise = value
                                                        .split(",")
                                                        .map((s) => s.trim())
                                                        .filter(Boolean);
                                                    form.setValue("instructorProfile.expertise", expertise, {
                                                        shouldValidate: true
                                                    });
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructorProfile.experience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience (years) *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="2"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const num = e.target.value ? Number(e.target.value) : 0;
                                                    field.onChange(num);
                                                }}
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
                                disabled={register.isPending}
                                className="h-11 flex-1 font-semibold rounded-lg"
                            >
                                {register.isPending ? (
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

"use client";

import { loginSchema, type SigninFormInput } from "@/validators/auth.schema";
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

import links from "@/constants/links";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { authMutations, useSendRegisterOtp } from "@/services/auth/mutations";
import { handleMutationError } from "@/services/common/mutation-error-handler";

type SigninForm = SigninFormInput;

export default function SigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [requires2FA, setRequires2FA] = useState(false);
  const [otp, setOtp] = useState("");

  // Auth Mutations
  const loginMutation = authMutations.useLogin();
  const sendOtpMutation = useSendRegisterOtp();
  const verify2FaMutation = authMutations.useVerifyLoginOtp();

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
    const savedCredentials =
      secureLocalStorage.getItem<SigninForm>("userCredentials");
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
    const response: any = await loginMutation.mutateAsync(data, {
      onError: (response) => {
        handleMutationError<SigninForm>(response, form.setError);
      },
    });

    // Check for 2FA requirement
    // Note: The mutation `onSuccess` handles the user setting if active.
    // We need to check if response indicates 2FA.
    // Since useReactQuery mutation result is the data returned by api function (if successful)

    if (response?.requires2FA) {
      setRequires2FA(true);
      return; // Stop here, don't redirect or save credentials yet
    }

    if (rememberMe) {
      secureLocalStorage.setItem("userCredentials", data);
      secureLocalStorage.setItem("rememberMe", true);
    } else {
      secureLocalStorage.removeItem("userCredentials");
      secureLocalStorage.removeItem("rememberMe");
    }
    router.push(links.HOME);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;

    await verify2FaMutation.mutateAsync(
      {
        email: form.getValues("email"),
        otp,
      },
      {
        onSuccess: () => {
          // Credentials saving (optional/debatable for 2FA flow)
          if (rememberMe) {
            secureLocalStorage.setItem("userCredentials", form.getValues());
            secureLocalStorage.setItem("rememberMe", true);
          }
          router.push(links.HOME);
        },
        onError: (error) => {
          handleMutationError(error, () => {}); // No form context for simple otp input, just toast?
          // Or we can set error on a generic error state
        },
      },
    );
  };

  const HandleResendOtp = () => {
    const email = form.getValues("email");

    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Email is required to verify",
      });
      return;
    }

    // For login 2FA, we might need a specific endpoint or generic send OTP
    // Assuming sendRegisterOtp (or similar) works or we reuse the login init?
    // Actually, calling login again triggers the OTP email for 2FA.
    loginMutation.mutate(form.getValues());
  };

  // 2FA FORM RENDER
  if (requires2FA) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            Enter the code sent to your email
          </p>
        </div>

        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div className="space-y-2">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={HandleResendOtp}
              disabled={loginMutation.isPending}
              className="text-primary hover:underline"
            >
              {loginMutation.isPending ? "Sending..." : "Resend Code"}
            </button>
            <button
              type="button"
              onClick={() => setRequires2FA(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Login
            </button>
          </div>

          <Button
            type="submit"
            disabled={verify2FaMutation.isPending || otp.length < 6}
            className="w-full"
          >
            {verify2FaMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              "Verify & Login"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {/* Reset password && reVerify */}

          <div className="flex flex-col">
            <div className="text-right">
              <a
                href={links.AUTH.RESET_PASSWORD}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            {/* 
                        <Button
                            type="button"
                            onClick={HandleResendOtp}
                            variant="link"
                            className="text-right p-0"
                            disabled={!form.watch("email") || sendOtpMutation.isPending}

                        >
                            {sendOtpMutation.isPending ? "Sending..." : "Verify Email"}
                        </Button> */}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!form.watch("email") || loginMutation.isPending}
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

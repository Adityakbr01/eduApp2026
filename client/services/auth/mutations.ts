import { QUERY_KEYS } from "@/config/query-keys";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import { secureLocalStorage } from "@/lib/utils/encryption";
import { useAuthStore } from "@/store/auth";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { mutationHandlers } from "../common/mutation-utils";
import { authApi } from "./api";
import type {
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    OtpResponse,
    RegisterRequest,
    SendOtpRequest,
    VerifyRegisterOtpRequest,
    VerifyResetPasswordOtpRequest,
} from "./types";

/* ---------------- REGISTER ---------------- */

export const useRegister = (
    options?: UseMutationOptions<OtpResponse, unknown, RegisterRequest>
) =>
    useMutation({
        mutationFn: authApi.register,
        onSuccess: (d) =>
            mutationHandlers.success(
                d.message || "Registration successful. Verify OTP."
            ),
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });

export const useSendRegisterOtp = (
    options?: UseMutationOptions<OtpResponse, unknown, SendOtpRequest>
) =>
    useMutation({
        mutationFn: authApi.sendRegisterOtp,
        onSuccess: (d) =>
            mutationHandlers.success(d.message || "OTP sent successfully"),
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });

export const useVerifyRegisterOtp = (
    options?: UseMutationOptions<OtpResponse, unknown, VerifyRegisterOtpRequest>
) =>
    useMutation({
        mutationFn: authApi.verifyRegisterOtp,
        onSuccess: (d) =>
            mutationHandlers.success(d.message || "Email verified"),
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });

/* ---------------- LOGIN ---------------- */

export const useLogin = (
    options?: UseMutationOptions<AuthResponse, unknown, LoginRequest>
) => {
    const { setUser } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setUser({
                userId: data.id!,
                name: data.name!,
                roleId: data.roleId,
                phone: data.phone,
                email: data.email,
                isEmailVerified: data.isEmailVerified,
                roleName: data.roleName,
            });
            qc.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
            mutationHandlers.success("Login successful");
        },
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });
};

/* ---------------- RESET PASSWORD ---------------- */

export const useSendResetPasswordOtp = (
    options?: UseMutationOptions<OtpResponse, unknown, SendOtpRequest>
) =>
    useMutation({
        mutationFn: authApi.sendResetPasswordOtp,
        onSuccess: (d) =>
            mutationHandlers.success(d.message || "OTP sent"),
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });

export const useVerifyResetPasswordOtp = (
    options?: UseMutationOptions<OtpResponse, unknown, VerifyResetPasswordOtpRequest>
) =>
    useMutation({
        mutationFn: authApi.verifyResetPasswordOtp,
        onSuccess: (d) =>
            mutationHandlers.success(d.message || "Password reset successful"),
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });

/* ---------------- CHANGE PASSWORD ---------------- */

export const useChangePassword = (
    options?: UseMutationOptions<{ message: string }, unknown, ChangePasswordRequest>
) => {
    const { clearAuth } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: (d) => {
            mutationHandlers.success(d.message);
            clearAuth();
            qc.clear();
        },
        onError: (error) => {
            mutationHandlers.error(error);
        },
        ...options,
    });
};

/* ---------------- LOGOUT ---------------- */

export const useLogout = () => {
    const { clearAuth } = useAuthStore();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            clearAuth();
            qc.clear();
            mutationHandlers.success("Logged out");
            secureLocalStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE_SECTION_KEY);
            secureLocalStorage.removeItem(STORAGE_KEYS.INSTRUCTOR_LAST_ACTIVE_SECTION_KEY);
            secureLocalStorage.removeItem(STORAGE_KEYS.BATCH_ACTIVE_VIEW);
            secureLocalStorage.removeItem(STORAGE_KEYS.BATCH_MOBILE_TAB);
        },
        onError: () => {
            clearAuth();
            qc.clear();
        },
    });
};



export const authMutations = {
    useRegister,
    useSendRegisterOtp,
    useVerifyRegisterOtp,
    useLogin,
    useSendResetPasswordOtp,
    useVerifyResetPasswordOtp,
    useChangePassword,
    useLogout,
};

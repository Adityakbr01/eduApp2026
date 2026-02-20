import api from "@/lib/api/axios";
import type {
    RegisterRequest,
    LoginRequest,
    SendOtpRequest,
    VerifyRegisterOtpRequest,
    VerifyResetPasswordOtpRequest,
    ChangePasswordRequest,
    AuthResponse,
    OtpResponse,
    ApiResponse,
} from "./types";

export const authApi = {
    register: async (data: RegisterRequest): Promise<OtpResponse> => {
        const res = await api.post<ApiResponse<OtpResponse>>("/auth/register", data);
        return res.data.data;
    },

    sendRegisterOtp: async (data: SendOtpRequest): Promise<OtpResponse> => {
        const res = await api.post<ApiResponse<OtpResponse>>(
            "/auth/register/send-otp",
            data
        );
        return res.data.data;
    },

    verifyRegisterOtp: async (
        data: VerifyRegisterOtpRequest
    ): Promise<OtpResponse> => {
        const res = await api.post<ApiResponse<OtpResponse>>(
            "/auth/register/verify-otp",
            data
        );
        return res.data.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data, { withCredentials: true });
        return res.data.data;
    },

    verifyLoginOtp: async (data: VerifyRegisterOtpRequest): Promise<AuthResponse> => {
        const res = await api.post<ApiResponse<AuthResponse>>(
            "/auth/verify-2fa",
            data
        );
        return res.data.data;
    },

    sendResetPasswordOtp: async (data: SendOtpRequest): Promise<OtpResponse> => {
        const res = await api.post<ApiResponse<OtpResponse>>(
            "/auth/reset-password/send-otp",
            data
        );
        return res.data.data;
    },

    verifyResetPasswordOtp: async (
        data: VerifyResetPasswordOtpRequest
    ): Promise<OtpResponse> => {
        const res = await api.post<ApiResponse<OtpResponse>>(
            "/auth/reset-password/verify-otp",
            data
        );
        return res.data.data;
    },

    changePassword: async (
        data: ChangePasswordRequest
    ): Promise<{ message: string }> => {
        const res = await api.post<ApiResponse<{ message: string }>>(
            "/auth/change-password",
            data
        );
        return res.data.data;
    },

    refreshToken: async (): Promise<{ accessToken: string }> => {
        const res = await api.post<ApiResponse<{ accessToken: string }>>(
            "/auth/token-refresh"
        );
        return res.data.data;
    },

    logout: async (): Promise<void> => {
        await api.post("/auth/logout");
    },
};

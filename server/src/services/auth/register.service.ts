import emailQueue from "src/bull/queues/email.queue.js";
import { addEmailJob } from "src/bull/workers/email.worker.js";
import cacheInvalidation from "src/cache/cacheInvalidation.js";
import otpCache from "src/cache/otpCache.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { ROLES } from "src/constants/roles.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CheckUserEmailAndBanned from "src/helpers/checkUserEmailAndBanned.js";
import { authRepository } from "src/repositories/auth.repository.js";
import type { RegisterSchemaInput } from "src/schemas/auth.schema.js";
import AppError from "src/utils/AppError.js";
import { generateOtp, verifyOtpHash } from "src/utils/OtpUtils.js";

export const registerService = {
    // ============================
    // REGISTER
    // ============================
    registerUserService: async (data: RegisterSchemaInput) => {
        const existingUser =
            await authRepository.findUserByEmailOrPhone(
                data.email,
                data.phone
            );

        if (existingUser) {
            if (existingUser.isBanned) {
                throw new AppError(
                    "Your account is banned",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN,
                    [{ path: 'email', message: 'Your account is banned' }]
                );
            }

            if (existingUser.phone === data.phone) {
                throw new AppError(
                    "Phone number already exists.",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.DUPLICATE_RESOURCE,
                    [
                        { path: 'phone', message: 'Account with this phone number already exists' }
                    ]
                );
            }

            if (!existingUser.isEmailVerified) {
                // OTP resend flow
                const { otp, hashedOtp } = await generateOtp();
                // Store OTP in Redis
                await otpCache.setOtp(existingUser.email, hashedOtp, "register");
                await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
                    email: existingUser.email,
                    otp,
                });

                return {
                    message: "Account exists but email not verified. OTP resent.",
                    email: existingUser.email,
                    userId: existingUser._id,
                };
            }


            throw new AppError(
                "Account already exists. Please login.",
                STATUSCODE.CONFLICT,
                ERROR_CODE.DUPLICATE_RESOURCE,
                [
                    { path: 'email', message: 'Account with this email already exists' },
                    { path: 'phone', message: 'Account with this phone number already exists' }
                ]
            );
        }


        const roleDoc =
            await authRepository.findRoleByName(data.role);

        if (!roleDoc) {
            throw new AppError(
                "Invalid role selected",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'role', message: 'Invalid role selected' }]
            );
        }

        const { otp, hashedOtp } = await generateOtp();

        const profileData: any = {};

        if (data.role === ROLES.INSTRUCTOR.code) {
            profileData.instructorProfile = data.instructorProfile;
            profileData.isInstructorApproved = false;
        }

        if (data.role === ROLES.MANAGER.code) {
            profileData.managerProfile = data.managerProfile;
            profileData.isManagerApproved = false;
        }

        if (data.role === ROLES.SUPPORT.code) {
            profileData.supportTeamProfile = data.supportTeamProfile;
            profileData.isSupportTeamApproved = false;
        }

        const user = await authRepository.createUser({
            name: data.name,
            email: data.email,
            password: data.password,
            roleId: roleDoc._id,
            phone: data.phone,
            address: data.address,
            ...profileData,
        });

        // Store OTP in Redis
        await otpCache.setOtp(user.email, hashedOtp, "register");

        if (roleDoc.name === ROLES.STUDENT.code) {
            await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
                email: user.email,
                otp,
            });
        }

        return {
            message:
                roleDoc.name === ROLES.STUDENT.code
                    ? "OTP sent to your email"
                    : "Registration successful. Awaiting approval from admin",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // SEND REGISTER OTP
    // ============================
    sendRegisterOtpService: async (email: string) => {
        const user =
            await authRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'email', message: 'Email is already verified' }]
            );
        }

        const { otp, hashedOtp } = await generateOtp();

        // Store OTP in Redis
        await otpCache.setOtp(user.email, hashedOtp, "register");

        await addEmailJob(emailQueue, EMAIL_JOB_NAMES.REGISTER_OTP, {
            email: user.email,
            otp,
        });

        return {
            message: "OTP sent successfully",
            userId: user._id,
            email: user.email,
        };
    },
    // ============================
    // VERIFY REGISTER OTP
    // ============================
    verifyRegisterOtpService: async (email: string, otp: string) => {
        const user =
            await authRepository.findUserByEmail(email);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        CheckUserEmailAndBanned(user);

        if (user.isEmailVerified) {
            throw new AppError(
                "Email is already verified",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: 'email', message: 'Email is already verified' }]
            );
        }

        // Get OTP from Redis
        const otpData = await otpCache.getOtp(email, "register");

        if (!otpData) {
            throw new AppError(
                "OTP expired or not found",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP has expired or not found' }]
            );
        }

        const isValidOtp = await verifyOtpHash(otp, otpData.hashedOtp);

        if (!isValidOtp) {
            throw new AppError(
                "Invalid OTP",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR, [{ path: 'otp', message: 'OTP is invalid' }]
            );
        }

        // Update user and delete OTP from Redis
        user.isEmailVerified = true;
        user.approvedBy = undefined;

        await authRepository.saveUser(user);
        await otpCache.deleteOtp(email, "register");
        await cacheInvalidation.invalidateUserEverything(String(user._id));

        return {
            message: "Email verified successfully",
            userId: user._id,
            email: user.email,
        };
    },
};

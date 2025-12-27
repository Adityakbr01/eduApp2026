import { z } from "zod";

// Role constants matching server
export const ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSTRUCTOR: "instructor",
    SUPPORT: "support_team",
    STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const RoleEnum = z.enum([
    ROLES.STUDENT,
    ROLES.MANAGER,
    ROLES.INSTRUCTOR,
    ROLES.SUPPORT,
    ROLES.ADMIN,
]);

// Base schema fields
const baseSchema = {
    role: RoleEnum,
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Must include at least one uppercase letter")
        .regex(/[a-z]/, "Must include at least one lowercase letter")
        .regex(/[0-9]/, "Must include at least one number"),
    phone: z
        .string()
        .optional()
        .refine(
            (value) => !value || /^[0-9]{10}$/.test(value),
            "Phone must be 10 digits"
        ),
    address: z.string().optional(),
};

// Role-specific profile schemas
const managerProfileSchema = z.object({
    department: z.string().min(2, "Department required"),
    teamSize: z.number().min(1, "Team size required"),
});

const instructorProfileSchema = z.object({
    bio: z.string().min(10, "Bio must be at least 10 chars"),
    expertise: z.array(z.string()).min(1, "At least one expertise required"),
    experience: z.number().min(1, "Experience required"),
});

const supportTeamProfileSchema = z.object({
    shiftTimings: z.string().min(2, "Shift timing required"),
    expertiseAreas: z.array(z.string()).min(1, "Expertise areas required"),
});

// Register schema with discriminated union
export const registerSchema = z.discriminatedUnion("role", [
    z.object({
        ...baseSchema,
        role: z.literal(ROLES.STUDENT),
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.MANAGER),
        managerProfile: managerProfileSchema,
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.INSTRUCTOR),
        instructorProfile: instructorProfileSchema,
    }),

    z.object({
        ...baseSchema,
        role: z.literal(ROLES.SUPPORT),
        supportTeamProfile: supportTeamProfileSchema,
    }),
]);

// Login schema
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

// OTP schemas
export const registerOtpSchema = z.object({
    email: z.string().email("Invalid email"),
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Reset password schemas
export const resetPasswordEmailSchema = z.object({
    email: z.string().email("Invalid email"),
});

export const resetPasswordVerifySchema = z.object({
    email: z.string().email("Invalid email"),
    otp: z.string().length(6, "OTP must be 6 characters"),
    newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Must include at least one uppercase letter")
        .regex(/[a-z]/, "Must include at least one lowercase letter")
        .regex(/[0-9]/, "Must include at least one number"),
});


export const registerVerifyOtpSchema = z.object({
    email: z.string().email({ message: "Enter a valid email address" }),
    otp: z
        .string()
        .length(6, { message: "OTP must be 6 digits" })
        .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

// TypeScript type inferred from Zod schema
export type RegisterVerifyOtpInput = z.infer<typeof registerVerifyOtpSchema>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;
export type SigninFormInput = z.infer<typeof loginSchema>;
export type StudentRegisterInput = z.infer<typeof registerSchema> & { role: typeof ROLES.STUDENT };
export type InstructorRegisterInput = z.infer<typeof registerSchema> & { role: typeof ROLES.INSTRUCTOR };
export type ManagerRegisterInput = z.infer<typeof registerSchema> & { role: typeof ROLES.MANAGER };
export type SupportRegisterInput = z.infer<typeof registerSchema> & { role: typeof ROLES.SUPPORT };
export type ResetPasswordEmailInput = z.infer<typeof resetPasswordEmailSchema>;
export type ResetPasswordVerifyInput = z.infer<typeof resetPasswordVerifySchema>;



//
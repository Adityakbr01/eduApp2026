import z from "zod";

// ============================================
// USER PREFERENCE VALIDATION SCHEMAS
// ============================================

/**
 * Email preferences validation
 */
export const emailPreferencesSchema = z.object({
    marketing: z.boolean().optional(),
    courseUpdates: z.boolean().optional(),
    loginNotification: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Security preferences validation
 */
export const securityPreferencesSchema = z.object({
    twoFactorEnabled: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Notification preferences validation
 */
export const notificationPreferencesSchema = z.object({
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    inApp: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Appearance preferences validation
 */
export const appearancePreferencesSchema = z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Regional preferences validation
 */
export const regionalPreferencesSchema = z.object({
    timezone: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Privacy preferences validation
 */
export const privacyPreferencesSchema = z.object({
    shareProfile: z.boolean().optional(),
    showActivity: z.boolean().optional(),
    allowAnalytics: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

/**
 * Complete preference update validation
 */
export const updatePreferencesSchema = z.object({
    email: emailPreferencesSchema.optional(),
    security: securityPreferencesSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one category required",
});

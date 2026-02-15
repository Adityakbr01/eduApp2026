import { ContentLevel, ContentType } from "@/services/courses";
import * as z from "zod";

export const editContentSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    marks: z.number().min(0, "Marks must be positive").default(0),
    isPreview: z.boolean().default(false),
    // Video specific
    minWatchPercent: z.number().min(0).max(100).optional(),
    duration: z.number().min(0).optional(), // seconds
    // File upload (optional, if replaced)
    rawKey: z.string().optional(),

    // important fields
    tags: z.array(z.string()).min(1, "At least one tag is required").optional().default([]),
    description: z.string().min(1, "Description is required").optional().default(""),
    level: z.enum(ContentLevel).default(ContentLevel.LOW),
    relatedLinks: z.array(z.object({
        title: z.string(),
        url: z.string(),
    })).optional().default([]),
});

// ============================================
// LESSON CONTENT SCHEMAS
// ============================================
export const createContentSchema = z.object({
    title: z.string().min(1, "Content title is required").max(200),
    type: z.nativeEnum(ContentType).optional(),
    marks: z.number().min(0, "Marks must be a positive number"),
    isVisible: z.boolean().default(true),
    isPreview: z.boolean().default(false),

    // Video fields
    videoUrl: z.string().url().or(z.literal('')).optional(),
    duration: z.number().min(0).optional(), // seconds
    minWatchPercent: z.number().min(0).max(100).default(90),

    // PDF fields
    pdfUrl: z.string().url().or(z.literal('')).optional(),
    totalPages: z.number().min(1).optional(),

    // important fields
    tags: z.array(z.string()).min(1, "At least one tag is required").optional().default([]), // Default empty
    description: z.string().min(1, "Description is required").optional().default(""), // Default empty
    level: z.enum(ContentLevel).default(ContentLevel.LOW),
    relatedLinks: z.array(z.object({
        title: z.string(),
        url: z.string(),
    })).optional().default([]),

    // Quiz/Assignment fields
    quizId: z.string().optional(),
}).refine((data) => {
    // Validate pdf type has pdfUrl (backend constraint)
    if (data.type === "pdf" && !data.pdfUrl) {
        // return false; // Temporarily allow it to see if backend handles it or if strictly blocked?
        // Backend Mongoose schema says PDF url is REQUIRED. So we strictly cannot create PDF without URL.
        // But we have no way to get URL without Content ID.
        // So PDF creation is effectively broken in this flow unless we upload first (but need ID).
        // For now, I'll keep PDF check but REMOVE video check.
        return false;
    }
    return true;
}, {
    message: "PDF content requires a file. Please upload a file first (Not fully supported in Add Dialog yet).",
});

export const updateContentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    type: z.nativeEnum(ContentType).optional(),
    marks: z.number().min(0).optional(),
    isVisible: z.boolean().optional(),
    videoUrl: z.string().url().optional(),
    duration: z.number().min(0).optional(),
    minWatchPercent: z.number().min(0).max(100).optional(),
    pdfUrl: z.string().url().optional(),
    totalPages: z.number().min(1).optional(),
    quizId: z.string().optional(),
    // important fields
    tags: z.array(z.string()).min(1, "At least one tag is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    level: z.nativeEnum(ContentLevel).default(ContentLevel.LOW),
    relatedLinks: z.array(z.object({
        title: z.string(),
        url: z.string(),
    })).optional().default([]),
});

export type EditContentFormValues = z.infer<typeof editContentSchema>;
export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
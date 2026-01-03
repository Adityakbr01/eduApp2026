import { CourseLevel, DeliveryMode } from "src/types/course.type.js";
import { z } from "zod";

// ============================================
// COURSE SCHEMAS
// ============================================
export const createCourseSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title cannot exceed 150 characters"),
    description: z.string()
        .min(10, "Description must be at least 10 characters"),
    shortDescription: z.string()
        .max(500, "Short description cannot exceed 500 characters"),
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().min(1, "SubCategory is required"),
    level: z.nativeEnum(CourseLevel).optional(),
    language: z.string().default("English"),
    deliveryMode: z.nativeEnum(DeliveryMode).optional(),
    coverImage: z.string().url().optional(),
    previewVideoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    pricing: z.object({
        price: z.number().min(0),
        currency: z.enum(["USD", "EUR", "INR"]).default("USD"),
        isFree: z.boolean().default(false),
    }).optional(),
    tags: z.array(z.string()).max(10, "Cannot have more than 10 tags").optional(),
    accessDuration: z.number().min(0).optional(),
    maxEnrollments: z.number().min(1).optional(),
    curriculum: z.string().optional(),
    seoTitle: z.string().max(70, "SEO Title cannot exceed 70 characters").optional(),
    seoDescription: z.string().max(160, "SEO Description cannot exceed 160 characters").optional(),
    seoKeywords: z.array(z.string()).optional(),
});

export const updateCourseSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title cannot exceed 150 characters")
        .optional(),
    description: z.string().min(10).optional(),
    shortDescription: z.string().max(500).optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.string().optional(),
    deliveryMode: z.enum(["recorded", "live", "hybrid"]).optional(),
    coverImage: z.string().url().optional(),
    previewVideoUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    pricing: z.object({
        price: z.number().min(0),
        currency: z.enum(["USD", "EUR", "INR"]).optional(),
        isFree: z.boolean().optional(),
    }).optional(),
    tags: z.array(z.string()).max(10).optional(),
    accessDuration: z.number().min(0).optional(),
    maxEnrollments: z.number().min(1).optional(),
    curriculum: z.string().optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
    seoKeywords: z.array(z.string()).optional(),
});

// ============================================
// SECTION SCHEMAS
// ============================================
export const createSectionSchema = z.object({
    title: z.string().min(1, "Section title is required").max(200),
    isVisible: z.boolean().default(true),
});

export const updateSectionSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    isVisible: z.boolean().optional(),
});

export const reorderSectionsSchema = z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
})).min(1, "At least one section is required");

// ============================================
// LESSON SCHEMAS
// ============================================
export const createLessonSchema = z.object({
    title: z.string().min(1, "Lesson title is required").max(200),
    isVisible: z.boolean().default(true),
});

export const updateLessonSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    isVisible: z.boolean().optional(),
});

export const reorderLessonsSchema = z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
})).min(1, "At least one lesson is required");

// ============================================
// LESSON CONTENT SCHEMAS
// ============================================
export const createContentSchema = z.object({
    title: z.string().min(1, "Content title is required").max(200),
    type: z.enum(["video", "pdf", "assignment", "quiz"]),
    marks: z.number().min(0, "Marks must be a positive number"),
    isVisible: z.boolean().default(true),

    // Video fields
    videoUrl: z.string().url().optional(),
    duration: z.number().min(0).optional(), // seconds
    minWatchPercent: z.number().min(0).max(100).default(90),

    // PDF fields
    pdfUrl: z.string().url().optional(),
    totalPages: z.number().min(1).optional(),

    // Quiz/Assignment fields
    quizId: z.string().optional(),
}).refine((data) => {
    // Validate video type has videoUrl
    if (data.type === "video" && !data.videoUrl) {
        return false;
    }
    // Validate pdf type has pdfUrl
    if (data.type === "pdf" && !data.pdfUrl) {
        return false;
    }
    return true;
}, {
    message: "Video content requires videoUrl, PDF content requires pdfUrl",
});

export const updateContentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    type: z.enum(["video", "pdf", "assignment", "quiz"]).optional(),
    marks: z.number().min(0).optional(),
    isVisible: z.boolean().optional(),
    videoUrl: z.string().url().optional(),
    duration: z.number().min(0).optional(),
    minWatchPercent: z.number().min(0).max(100).optional(),
    pdfUrl: z.string().url().optional(),
    totalPages: z.number().min(1).optional(),
    quizId: z.string().optional(),
});

export const reorderContentsSchema = z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
})).min(1, "At least one content is required");

// ============================================
// CONTENT PROGRESS SCHEMAS (STUDENT)
// ============================================
export const saveProgressSchema = z.object({
    resumeAt: z.number().min(0).optional(),
    totalDuration: z.number().min(0).optional(),
    obtainedMarks: z.number().min(0).optional(),
    isCompleted: z.boolean().optional(),
});

export const updateResumeSchema = z.object({
    resumeAt: z.number().min(0),
    totalDuration: z.number().min(0).optional(),
});

export const markCompletedSchema = z.object({
    obtainedMarks: z.number().min(0).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressSchema>
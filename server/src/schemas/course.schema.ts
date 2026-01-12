import { ContentType, CourseLevel, DeliveryMode, Language } from "src/types/course.type.js";
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
    category: z.string().min(1, "Category is required"), // category mongoId 
    subCategory: z.string().min(1, "SubCategory is required"), // subcategory mongoId
    level: z.nativeEnum(CourseLevel).optional(),
    language: z.nativeEnum(Language).optional(),
    deliveryMode: z.nativeEnum(DeliveryMode).optional(),
    coverImage: z.string().optional(),
    previewVideoUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    pricing: z.object({
        price: z.number().min(0),
        originalPrice: z.number().min(0).optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        discountExpiresAt: z.string().optional(),
        currency: z.enum(["USD", "EUR", "INR", "GBP"]).optional(),
        isFree: z.boolean().optional(),
    }).optional(),
    tags: z.array(z.string()).max(10, "Cannot have more than 10 tags").optional(),
    accessDuration: z.number().min(0).optional(),
    maxEnrollments: z.number().min(1).optional(),
    curriculum: z.string().optional(),
    durationWeeks: z.number().min(1).max(520).optional(),
});

export const updateCourseSchema = z.object({
    title: z.string()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title cannot exceed 150 characters")
        .optional(),
    description: z.string().min(10).optional(),
    shortDescription: z.string().max(500).optional(),
    category: z.string().optional(), //category 
    subCategory: z.string().optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    language: z.nativeEnum(Language).optional(),
    deliveryMode: z.nativeEnum(DeliveryMode).optional(),
    coverImage: z.string().optional(),
    previewVideoUrl: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    pricing: z.object({
        price: z.number().min(0),
        originalPrice: z.number().min(0).optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        discountExpiresAt: z.string().optional(),
        currency: z.enum(["USD", "EUR", "INR", "GBP"]).optional(),
        isFree: z.boolean().optional(),
    }).optional(),
    tags: z.array(z.string()).max(10).optional(),
    accessDuration: z.number().min(0).optional(),
    maxEnrollments: z.number().min(1).optional(),
    curriculum: z.string().optional(),
    durationWeeks: z.number().min(1).max(520).optional(),
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
    title: z.string().min(1, "Content title is required").max(200).trim(),
    type: z.nativeEnum(ContentType).optional(),
    marks: z.number().min(0, "Marks must be a positive number"),
    isVisible: z.boolean().default(true),
    isPreview: z.boolean().default(false),

    // 🎥 VIDEO/AUDIO (nested)
    video: z.object({
        rawKey: z.string().optional(),
        duration: z.number().min(0).optional(),
        minWatchPercent: z.number().min(0).max(100).default(90),
    }).optional(),

    // 📄 PDF (nested)
    pdf: z.object({
        rawKey: z.string().optional(),
        totalPages: z.number().min(1).optional(),
    }).optional(),

    audio: z.object({
        rawKey: z.string().optional(),
        duration: z.number().min(0).optional(),
    }).optional(),

    // 📝 QUIZ/ASSIGNMENT (nested)
    assessment: z.object({
        refId: z.string().optional(),
        type: z.enum(["quiz", "assignment"]).optional(),
    }).optional(),
}).refine((data) => {
    // Validate video type has video.url
    if (data.type === "video" && !data.video?.rawKey) {
        return false;
    }
    // Validate audio type has video.url (audio uses video object)
    if (data.type === "audio" && !data.video?.rawKey) {
        return false;
    }
    // Validate pdf type has pdf.url
    if (data.type === "pdf" && !data.pdf?.rawKey) {
        return false;
    }
    return true;
}, {
    message: "Video/Audio content requires video.url, PDF content requires pdf.url",
});

export const updateContentSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    type: z.nativeEnum(ContentType).optional(),
    marks: z.number().min(0).optional(),
    isVisible: z.boolean().optional(),
    isPreview: z.boolean().optional(),

    // 🎥 VIDEO (nested)
    video: z.object({
        url: z.string().optional(),
        duration: z.number().min(0).optional(),
        minWatchPercent: z.number().min(0).max(100).optional(),
    }).optional(),

    // 📄 PDF (nested)
    pdf: z.object({
        url: z.string().optional(),
        totalPages: z.number().min(1).optional(),
    }).optional(),

    audio: z.object({
        url: z.string().optional(),
        duration: z.number().min(0).optional(),
    }).optional(),

    // 📝 QUIZ/ASSIGNMENT (nested)
    assessment: z.object({
        refId: z.string().optional(),
        type: z.enum(["quiz", "assignment"]).optional(),
    }).optional(),
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
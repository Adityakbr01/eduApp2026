import { z } from "zod";

// ============================================
// QUIZ SCHEMAS
// ============================================

export const quizQuestionSchema = z.object({
    question: z.string().min(1, "Question is required").max(1000),
    options: z.array(z.string().min(1)).min(2, "At least 2 options required").max(6, "Maximum 6 options allowed"),
    correctAnswerIndex: z.number().int().min(0),
    marks: z.number().min(0).default(1),
    explanation: z.string().max(500).optional(),
});

export const createQuizSchema = z.object({
    courseId: z.string().min(1, "Course ID is required"),
    lessonId: z.string().min(1, "Lesson ID is required"),
    contentId: z.string().min(1, "Content ID is required"),
    title: z.string().min(1, "Quiz title is required").max(200),
    description: z.string().max(1000).optional(),
    passingMarks: z.number().min(0).optional(),
    timeLimit: z.number().min(0).optional(), // in minutes
    questions: z.array(quizQuestionSchema).min(1, "At least one question is required"),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showCorrectAnswers: z.boolean().default(true),
    maxAttempts: z.number().min(1).default(3),
}).refine((data) => {
    // Validate correctAnswerIndex is within options range
    for (const q of data.questions) {
        if (q.correctAnswerIndex >= q.options.length) {
            return false;
        }
    }
    return true;
}, {
    message: "correctAnswerIndex must be a valid index within options array",
});

export const updateQuizSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    passingMarks: z.number().min(0).optional(),
    timeLimit: z.number().min(1).optional(),
    questions: z.array(quizQuestionSchema).min(1).optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    showCorrectAnswers: z.boolean().optional(),
    maxAttempts: z.number().min(1).optional(),
});

export const addQuestionSchema = quizQuestionSchema;

export const updateQuestionSchema = z.object({
    question: z.string().min(1).max(1000).optional(),
    options: z.array(z.string().min(1)).min(2).max(6).optional(),
    correctAnswerIndex: z.number().int().min(0).optional(),
    marks: z.number().min(0).optional(),
    explanation: z.string().max(500).optional(),
});

// ============================================
// ASSIGNMENT SCHEMAS
// ============================================

export const submissionConfigSchema = z.object({
    type: z.enum(["file", "text", "link", "code"]).default("file"),
    allowedFormats: z.array(z.string()).optional(),
    maxFileSizeMB: z.number().min(1).max(100).default(10),
});

export const createAssignmentSchema = z.object({
    courseId: z.string().min(1, "Course ID is required"),
    lessonId: z.string().min(1, "Lesson ID is required"),
    contentId: z.string().min(1, "Content ID is required"),
    title: z.string().min(1, "Assignment title is required").max(200),
    description: z.string().min(1, "Assignment description is required"),
    instructions: z.array(z.string()).default([]),
    submission: submissionConfigSchema.default({
        type: "file",
        allowedFormats: ["pdf", "zip"],
        maxFileSizeMB: 10,
    }),
    totalMarks: z.number().min(0).default(100),
    dueDate: z.string().datetime().optional(), // ISO date string
    isAutoEvaluated: z.boolean().default(false),
});

export const updateAssignmentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    instructions: z.array(z.string()).optional(),
    submission: submissionConfigSchema.optional(),
    totalMarks: z.number().min(0).optional(),
    dueDate: z.string().datetime().optional(),
    isAutoEvaluated: z.boolean().optional(),
});

// ============================================
// QUIZ ATTEMPT SCHEMAS
// ============================================

export const submitQuizAttemptSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string().min(1),
        selectedOptionIndex: z.number().int().min(0),
    })),
    timeTaken: z.number().min(0).optional(), // in seconds
});

// ============================================
// ASSIGNMENT SUBMISSION SCHEMAS
// ============================================

export const submitAssignmentSchema = z.object({
    submissionType: z.enum(["file", "text", "link", "code"]),
    fileUrl: z.string().url().optional(),
    textContent: z.string().optional(),
    linkUrl: z.string().url().optional(),
    codeContent: z.string().optional(),
    codeLanguage: z.string().optional(),
}).refine((data) => {
    if (data.submissionType === "file" && !data.fileUrl) return false;
    if (data.submissionType === "text" && !data.textContent) return false;
    if (data.submissionType === "link" && !data.linkUrl) return false;
    if (data.submissionType === "code" && !data.codeContent) return false;
    return true;
}, {
    message: "Submission content is required based on submission type",
});

export const gradeAssignmentSchema = z.object({
    obtainedMarks: z.number().min(0),
    feedback: z.string().max(2000).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeAssignmentInput = z.infer<typeof gradeAssignmentSchema>;

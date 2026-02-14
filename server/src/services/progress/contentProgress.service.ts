import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { contentAttemptRepository } from "src/repositories/contentAttempt.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
import { lessonRepository } from "src/repositories/lesson.repository.js";
import AppError from "src/utils/AppError.js";


// ============================================
// CONTENT PROGRESS SERVICE (STUDENT SIDE)
// ============================================
export const contentProgressService = {
    // -------------------- SAVE/UPDATE PROGRESS --------------------
    saveProgress: async (
        userId: string,
        contentId: string,
        data: {
            resumeAt?: number;
            totalDuration?: number;
            obtainedMarks?: number;
            isCompleted?: boolean;
        }
    ) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const progressData = {
            ...data,
            courseId: content.courseId,
            lessonId: content.lessonId,
            totalMarks: content.marks,
        };

        return contentAttemptRepository.upsert(userId, contentId, progressData);
    },

    // -------------------- GET PROGRESS --------------------
    getProgress: async (userId: string, contentId: string) => {
        return contentAttemptRepository.findByUserAndContent(userId, contentId);
    },

    // -------------------- MARK COMPLETED --------------------
    markCompleted: async (
        userId: string,
        contentId: string,
        obtainedMarks?: number,
        completionMethod: "auto" | "manual" = "auto"
    ) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const lesson = await lessonRepository.findById(content.lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Anti-cheat: manual complete caps at 90% of total marks
        const totalMarks = content.marks || 100;
        let finalMarks = obtainedMarks ?? totalMarks;

        if (completionMethod === "manual") {
            const maxManualMarks = Math.floor(totalMarks * 0.9); // 90% cap
            finalMarks = Math.min(finalMarks, maxManualMarks);
        }

        // ⏰ DEADLINE PENALTY CHECK
        if (lesson.deadline?.dueDate && new Date() > new Date(lesson.deadline.dueDate)) {
            const penaltyPercent = lesson.deadline.penaltyPercent || 0;
            if (penaltyPercent > 0) {
                finalMarks = Math.floor(finalMarks * (1 - penaltyPercent / 100));
            }
        }

        return contentAttemptRepository.markCompleted(
            userId,
            contentId,
            content.courseId,
            content.lessonId,
            finalMarks,
            completionMethod
        );
    },

    // -------------------- UPDATE RESUME POSITION --------------------
    updateResumePosition: async (
        userId: string,
        contentId: string,
        resumeAt: number,
        totalDuration?: number
    ) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const lesson = await lessonRepository.findById(content.lessonId);

        // Calculate proportional marks if totalDuration is available
        let obtainedMarks = 0;
        if (totalDuration && totalDuration > 0 && content.marks > 0) {
            const percentage = Math.min(Math.max(resumeAt / totalDuration, 0), 1);
            obtainedMarks = Math.floor(content.marks * percentage);

            // ⏰ DEADLINE PENALTY CHECK
            if (lesson?.deadline?.dueDate && new Date() > new Date(lesson.deadline.dueDate)) {
                const penaltyPercent = lesson.deadline.penaltyPercent || 0;
                if (penaltyPercent > 0) {
                    obtainedMarks = Math.floor(obtainedMarks * (1 - penaltyPercent / 100));
                }
            }
        }

        return contentAttemptRepository.updateResumePosition(
            userId,
            contentId,
            content.courseId,
            content.lessonId,
            resumeAt,
            totalDuration,
            obtainedMarks // Pass calculated marks
        );
    },
};

import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { contentAttemptRepository } from "src/repositories/contentAttempt.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
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
    markCompleted: async (userId: string, contentId: string, obtainedMarks?: number) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return contentAttemptRepository.markCompleted(userId, contentId, obtainedMarks);
    },

    // -------------------- UPDATE RESUME POSITION --------------------
    updateResumePosition: async (
        userId: string,
        contentId: string,
        resumeAt: number,
        totalDuration?: number
    ) => {
        return contentAttemptRepository.updateResumePosition(
            userId,
            contentId,
            resumeAt,
            totalDuration
        );
    },
};

import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import AppError from "src/utils/AppError.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";

// ============================================
// INSTRUCTOR CONTROLLER
// ============================================
export const instructorController = {
    /**
     * Unlock/lock a section manually
     * PUT /api/classroom/:courseId/section/:sectionId/unlock
     * Body: { unlock: boolean }
     */
    toggleSectionUnlock: catchAsync(async (req, res) => {
        const { courseId, sectionId } = req.params;
        const { unlock } = req.body;

        const section = await Section.findOneAndUpdate(
            { _id: sectionId, courseId },
            { $set: { isManuallyUnlocked: unlock !== false } },
            { new: true },
        );

        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        sendResponse(res, 200, `Section ${unlock !== false ? "unlocked" : "locked"}`, section);
    }),

    /**
     * Unlock/lock a lesson manually
     * PUT /api/classroom/:courseId/lesson/:lessonId/unlock
     * Body: { unlock: boolean }
     */
    toggleLessonUnlock: catchAsync(async (req, res) => {
        const { courseId, lessonId } = req.params;
        const { unlock } = req.body;

        const lesson = await Lesson.findOneAndUpdate(
            { _id: lessonId, courseId },
            { $set: { isManuallyUnlocked: unlock !== false } },
            { new: true },
        );

        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        sendResponse(res, 200, `Lesson ${unlock !== false ? "unlocked" : "locked"}`, lesson);
    }),

    /**
     * Update content deadline/penalty
     * PUT /api/classroom/:courseId/content/:contentId/deadline
     * Body: { dueDate?, startDate?, penaltyPercent?, defaultPenalty? }
     */
    updateContentDeadline: catchAsync(async (req, res) => {
        const { courseId, contentId } = req.params;
        const { dueDate, startDate, penaltyPercent, defaultPenalty } = req.body;

        const updateData: any = {};
        if (dueDate !== undefined) updateData["deadline.dueDate"] = dueDate ? new Date(dueDate) : null;
        if (startDate !== undefined) updateData["deadline.startDate"] = startDate ? new Date(startDate) : null;
        if (penaltyPercent !== undefined) updateData["deadline.penaltyPercent"] = penaltyPercent;
        if (defaultPenalty !== undefined) updateData["deadline.defaultPenalty"] = defaultPenalty;

        const content = await LessonContent.findOneAndUpdate(
            { _id: contentId, courseId },
            { $set: updateData },
            { new: true },
        );

        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        sendResponse(res, 200, "Deadline updated", content);
    }),
};

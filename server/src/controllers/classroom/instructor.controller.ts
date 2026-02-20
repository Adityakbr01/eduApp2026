import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";
import AppError from "src/utils/AppError.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";

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
        const { unlock, lessonUnlock } = req.body;

        const section = await Section.findOneAndUpdate(
            { _id: sectionId, courseId },
            { $set: { isManuallyUnlocked: unlock !== false } },
            { new: true },
        );

        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Recursive unlock for lessons if requested
        if (lessonUnlock === true) {
            await Lesson.updateMany(
                { sectionId, courseId },
                { $set: { isManuallyUnlocked: unlock !== false } }
            );
        }

        // Invalidate caches
        await batchRepository.invalidateCourseStructure(courseId);
        await courseProgressRepository.invalidateAll(courseId);

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

        // Invalidate caches
        await batchRepository.invalidateCourseStructure(courseId);
        await courseProgressRepository.invalidateAll(courseId);

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

        // Invalidate caches (structure contains deadline info)
        await batchRepository.invalidateCourseStructure(courseId);
        // We may or may not need to invalidate progress if deadlines affect completion/marks, 
        // but typically deadlines affect *future* submissions or penalties, not structure.
        // However, if we want to be safe:
        // await courseProgressRepository.invalidateAll(courseId); 
        // Logic: deadlines are used in progress calculation for penalty? Yes.
        // So we probably should invalidate all progress too if we want immediate recalculation of "obtained marks" 
        // (if the user already submitted and now the deadline changed, their penalty might change? 
        // Actually, penalties are usually applied at submission time. 
        // But `calculateCourseProgress` in classroom service uses `computeLessonMeta` which uses current deadlines.
        // So yes, modifying a deadline might change the *display* of potential marks or locked status.
        // Let's add it for consistency.)
        await courseProgressRepository.invalidateAll(courseId);


        sendResponse(res, 200, "Deadline updated", content);
    }),
};

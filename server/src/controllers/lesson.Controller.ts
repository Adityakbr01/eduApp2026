import { lessonService } from "src/services/lesson.Service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";



// ============================================
// LESSON CONTROLLER (INSTRUCTOR)
// ============================================
export const lessonController = {
    // -------------------- CREATE LESSON --------------------
    createLesson: catchAsync<{ sectionId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonService.createLesson(
            req.params.sectionId,
            instructorId,
            req.body
        );
        sendResponse(res, 201, "Lesson created successfully", result);
    }),

    // -------------------- GET LESSONS BY SECTION --------------------
    getLessonsBySection: catchAsync<{ sectionId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonService.getLessonsBySection(
            req.params.sectionId,
            instructorId
        );
        sendResponse(res, 200, "Lessons fetched successfully", result);
    }),

    // -------------------- UPDATE LESSON --------------------
    updateLesson: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonService.updateLesson(
            req.params.id,
            instructorId,
            req.body
        );
        sendResponse(res, 200, "Lesson updated successfully", result);
    }),

    // -------------------- DELETE LESSON --------------------
    deleteLesson: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonService.deleteLesson(req.params.id, instructorId);
        sendResponse(res, 200, "Lesson deleted successfully", result);
    }),

    // -------------------- REORDER LESSONS --------------------
    reorderLessons: catchAsync<{ sectionId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const lessons = req.body; // Direct array from body
        const result = await lessonService.reorderLessons(
            req.params.sectionId,
            instructorId,
            lessons
        );
        sendResponse(res, 200, "Lessons reordered successfully", result);
    }),

    // -------------------- TOGGLE VISIBILITY --------------------
    toggleVisibility: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonService.toggleVisibility(req.params.id, instructorId);
        sendResponse(res, 200, "Lesson visibility updated", result);
    }),
};
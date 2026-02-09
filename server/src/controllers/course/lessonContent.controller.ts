
// ============================================
// LESSON CONTENT CONTROLLER (INSTRUCTOR)

import { lessonContentService } from "src/services/course/lessonContent.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
export const lessonContentController = {
    // -------------------- CREATE CONTENT --------------------
    createContent: catchAsync<{ lessonId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonContentService.createContent(
            req.params.lessonId,
            instructorId,
            req.body
        );
        sendResponse(res, 201, "Content created successfully", result);
    }),

    // -------------------- GET CONTENTS BY LESSON --------------------
    getContentsByLesson: catchAsync<{ lessonId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonContentService.getContentsByLesson(
            req.params.lessonId,
            instructorId
        );
        sendResponse(res, 200, "Contents fetched successfully", result);
    }),

    // -------------------- UPDATE CONTENT --------------------
    updateContent: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonContentService.updateContent(
            req.params.id,
            instructorId,
            req.body
        );
        sendResponse(res, 200, "Content updated successfully", result);
    }),

    // -------------------- DELETE CONTENT --------------------
    deleteContent: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonContentService.deleteContent(req.params.id, instructorId);
        sendResponse(res, 200, "Content deleted successfully", result);
    }),

    // -------------------- REORDER CONTENTS --------------------
    reorderContents: catchAsync<{ lessonId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const contents = req.body; // Direct array from body
        const result = await lessonContentService.reorderContents(
            req.params.lessonId,
            instructorId,
            contents
        );
        sendResponse(res, 200, "Contents reordered successfully", result);
    }),

    // -------------------- TOGGLE VISIBILITY --------------------
    toggleVisibility: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await lessonContentService.toggleVisibility(req.params.id, instructorId);
        sendResponse(res, 200, "Content visibility updated", result);
    }),
};
import { batchService } from "src/services/classroom/batch.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// BATCH CONTROLLER
// ============================================
export const batchController = {
    /**
     * Get batch detail data for the logged-in student
     * GET /api/classroom/:courseId/batch
     */
    getBatchDetail: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;

        const result = await batchService.getBatchDetail(userId, courseId);

        sendResponse(res, 200, "Batch detail retrieved", result);
    }),

    /**
     * Get content detail for a specific lesson content
     * GET /api/classroom/:courseId/content/:contentId
     */
    getContentDetail: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { courseId, contentId } = req.params;

        const result = await batchService.getContentDetail(userId, courseId, contentId);

        sendResponse(res, 200, "Content detail retrieved", result);
    }),

    /**
     * Get lesson details (contents list) - Lazy Loading
     * GET /api/classroom/:courseId/lesson/:lessonId
     */
    getLessonDetails: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { courseId, lessonId } = req.params;

        const result = await batchService.getLessonDetails(userId, courseId, lessonId);

        sendResponse(res, 200, "Lesson details retrieved", result);
    }),

    /**
     * Get leaderboard for the batch
     * GET /api/classroom/:courseId/leaderboard
     */
    getBatchLeaderboard: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const { courseId } = req.params;

        const result = await batchService.getLeaderboard(userId, courseId);

        sendResponse(res, 200, "Leaderboard retrieved", result);
    }),
};

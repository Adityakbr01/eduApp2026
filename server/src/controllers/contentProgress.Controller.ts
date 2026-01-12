// ============================================
// CONTENT PROGRESS CONTROLLER (STUDENT)

import { contentProgressService } from "src/services/contentProgress.Service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
export const contentProgressController = {
    // -------------------- SAVE PROGRESS --------------------
    saveProgress: catchAsync<{ contentId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const result = await contentProgressService.saveProgress(
            userId,
            req.params.contentId,
            req.body
        );
        sendResponse(res, 200, "Progress saved successfully", result);
    }),

    // -------------------- GET PROGRESS --------------------
    getProgress: catchAsync<{ contentId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const result = await contentProgressService.getProgress(userId, req.params.contentId);
        sendResponse(res, 200, "Progress fetched successfully", result);
    }),

    // -------------------- MARK COMPLETED --------------------
    markCompleted: catchAsync<{ contentId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { obtainedMarks } = req.body;
        const result = await contentProgressService.markCompleted(
            userId,
            req.params.contentId,
            obtainedMarks
        );
        sendResponse(res, 200, "Content marked as completed", result);
    }),

    // -------------------- UPDATE RESUME POSITION --------------------
    updateResumePosition: catchAsync<{ contentId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const { resumeAt, totalDuration } = req.body;
        const result = await contentProgressService.updateResumePosition(
            userId,
            req.params.contentId,
            resumeAt,
            totalDuration
        );
        sendResponse(res, 200, "Resume position updated", result);
    }),
};
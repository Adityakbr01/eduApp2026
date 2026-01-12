
// ============================================
// COURSE PROGRESS CONTROLLER (STUDENT - AGGREGATION API)

import { courseProgressService } from "src/services/courseProgress.Service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
export const courseProgressController = {
    // -------------------- GET FULL COURSE WITH PROGRESS --------------------
    getCourseWithProgress: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const result = await courseProgressService.getCourseWithProgress(
            userId,
            req.params.courseId
        );
        sendResponse(res, 200, "Course with progress fetched successfully", result);
    }),

    // -------------------- GET RESUME INFO --------------------
    getResumeInfo: catchAsync<{ courseId: string }>(async (req, res) => {
        const userId = req.user!.id;
        const result = await courseProgressService.getResumeInfo(userId, req.params.courseId);
        sendResponse(res, 200, "Resume info fetched successfully", result);
    }),
};

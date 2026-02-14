import { classroomService } from "src/services/classroom/classroom.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// CLASSROOM CONTROLLER
// ============================================
export const classroomController = {
    /**
     * Get classroom data for the logged-in student
     * GET /api/classroom
     */
    getClassroomData: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const result = await classroomService.getClassroomData(userId);
        sendResponse(res, 200, "Classroom data retrieved", result);
    }),
};

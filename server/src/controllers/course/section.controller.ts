
import { sectionService } from "src/services/course/section.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";


// ============================================
// SECTION CONTROLLER (INSTRUCTOR)
// ============================================
export const sectionController = {
    // -------------------- CREATE SECTION --------------------
    createSection: catchAsync<{ courseId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await sectionService.createSection(
            req.params.courseId,
            instructorId,
            req.body
        );
        sendResponse(res, 201, "Section created successfully", result);
    }),

    // -------------------- GET SECTIONS BY COURSE --------------------
    getSectionsByCourse: catchAsync<{ courseId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await sectionService.getSectionsByCourse(
            req.params.courseId,
            instructorId
        );
        sendResponse(res, 200, "Sections fetched successfully", result);
    }),

    // -------------------- UPDATE SECTION --------------------
    updateSection: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await sectionService.updateSection(
            req.params.id,
            instructorId,
            req.body
        );
        sendResponse(res, 200, "Section updated successfully", result);
    }),

    // -------------------- DELETE SECTION --------------------
    deleteSection: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await sectionService.deleteSection(req.params.id, instructorId);
        sendResponse(res, 200, "Section deleted successfully", result);
    }),

    // -------------------- REORDER SECTIONS --------------------
    reorderSections: catchAsync<{ courseId: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const sections = req.body; // Direct array from body
        const result = await sectionService.reorderSections(
            req.params.courseId,
            instructorId,
            sections
        );
        sendResponse(res, 200, "Sections reordered successfully", result);
    }),

    // -------------------- TOGGLE VISIBILITY --------------------
    toggleVisibility: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await sectionService.toggleVisibility(req.params.id, instructorId);
        sendResponse(res, 200, "Section visibility updated", result);
    }),
};
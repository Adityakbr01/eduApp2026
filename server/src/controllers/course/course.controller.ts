
import {
    courseService
} from "src/services/course/course.service.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

// ============================================
// COURSE CONTROLLER (INSTRUCTOR)
// ============================================
const courseController = {
    // -------------------- GET ALL PUBLISHED COURSES --------------------
    getAllPublishedCourses: catchAsync(async (req, res) => {
        const { page, limit, search, category } = req.query as any;
        const result = await courseService.getAllPublishedCourses({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search,
            category,
        });
        sendResponse(res, 200, "Published courses fetched successfully", result);
    }),

    // -------------------- GET PUBLISHED COURSE BY ID --------------------
    getPublishedCourseById: catchAsync<{ id: string }>(async (req, res) => {
        const result = await courseService.getPublishedCourseById(req.params.id);
        sendResponse(res, 200, "Published course fetched successfully", result);
    }),


    // -------------------- CREATE COURSE --------------------
    createCourse: catchAsync(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await courseService.createCourse(instructorId, req.body);
        sendResponse(res, 201, "Course created successfully", result);
    }),

    // -------------------- GET ALL INSTRUCTOR COURSES --------------------
    getInstructorCourses: catchAsync(async (req, res) => {
        const instructorId = req.user!.id;
        const { page, limit, status, search } = req.query as any;
        const result = await courseService.getInstructorCourses(instructorId, {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
            search,
        });
        sendResponse(res, 200, "Courses fetched successfully", result);
    }),

    // -------------------- GET COURSE BY ID --------------------
    getCourseById: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await courseService.getCourseById(req.params.id, instructorId);
        sendResponse(res, 200, "Course fetched successfully", result);
    }),

    // -------------------- UPDATE COURSE --------------------
    updateCourse: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await courseService.updateCourse(req.params.id, instructorId, req.body);
        sendResponse(res, 200, "Course updated successfully", result);
    }),

    // -------------------- DELETE COURSE --------------------
    deleteCourse: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await courseService.deleteCourse(req.params.id, instructorId);
        sendResponse(res, 200, "Course deleted successfully", result);
    }),

    // -------------------- PUBLISH/UNPUBLISH COURSE --------------------
    togglePublishCourse: catchAsync<{ id: string }>(async (req, res) => {
        const instructorId = req.user!.id;
        const result = await courseService.submitCourseStatusRequest(req.params.id, instructorId, req.body.status);
        sendResponse(res, 200, "Course publish status updated, please wait for approval", result);
    }),
    // -------------------- GET COURSES FOR ADMIN WITH PAGINATION AND FILTERING --------------------
    GetCourseForAdmin: catchAsync(async (req, res) => {
        const { page, limit, status, search } = req.query as any;
        const result = await courseService.getCoursesForAdmin({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
            search,
        });
        sendResponse(res, 200, "Courses fetched successfully for Admin", result);
    }),
    // -------------------- TOGGLE COURSE STATUS (ADMIN) --------------------
    toggleCourseStatusAdmin: catchAsync<{ requestId: string }>(async (req, res) => {
        const adminId = req.user!.id;
        const result = await courseService.toggleCourseStatusAdmin(req.params.requestId, req.body.action, adminId, req.body.reason);
        sendResponse(res, 200, "Course status updated successfully by Admin", result);
    }),
    toggleFeaturedCourse: catchAsync<{ id: string }>(async (req, res) => {
        const adminId = req.user!.id;
        const result = await courseService.toggleFeaturedCourse(req.params.id, adminId);
        sendResponse(res, 200, "Course featured status toggled successfully by Admin", result);
    }),
    getFeaturedCourses: catchAsync(async (req, res) => {
        const result = await courseService.getFeaturedCourses();
        sendResponse(res, 200, "Featured courses fetched successfully", { courses: result });
    }),

    // -------------------- REORDER COURSES (ADMIN) --------------------
    reorderCourses: catchAsync(async (req, res) => {
        const { items } = req.body; // Expecting { items: { id: string, order: number }[] }

        // We'll trust the service to handle the logic, or we can do a simple loop here if service method doesn't exist yet.
        // Since I need to implement the service method too, I'll add it to the service first or simply do the update here if it's simple enough.
        // Actually, better to keep logic in service.
        await courseService.reorderCourses(items);

        sendResponse(res, 200, "Courses reordered successfully", null);
    }),
};

export default courseController;

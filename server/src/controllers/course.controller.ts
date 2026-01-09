
import {
    courseService,
    sectionService,
    lessonService,
    lessonContentService,
    contentProgressService,
    courseProgressService,
} from "src/services/course.service.js";
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
};

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

// ============================================
// LESSON CONTENT CONTROLLER (INSTRUCTOR)
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

// ============================================
// CONTENT PROGRESS CONTROLLER (STUDENT)
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

// ============================================
// COURSE PROGRESS CONTROLLER (STUDENT - AGGREGATION API)
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

export default courseController;

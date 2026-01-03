import { STATUSCODE } from "src/constants/statusCodes.js";
import { SUCCESS_CODE } from "src/constants/successCodes.js";
import courseService from "src/services/course.service.js";
import type { CourseFilterDTO, CoursePaginationDTO } from "src/types/course.type.js";
import { catchAsync } from "src/utils/catchAsync.js";
import { sendResponse } from "src/utils/sendResponse.js";

const courseController = {
    // ==================== PUBLIC ROUTES ====================

    /**
     * @desc    Get all published courses (public)
     * @route   GET /api/v1/courses
     * @access  Public
     */
    getAllCourses: catchAsync(async (req, res) => {
        const filter: CourseFilterDTO = {
            category: req.query.category as string,
            subCategory: req.query.subCategory as string,
            level: req.query.level as any,
            deliveryMode: req.query.deliveryMode as any,
            language: req.query.language as string,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
            instructor: req.query.instructor as string,
            search: req.query.search as string,
        };

        const pagination: CoursePaginationDTO = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            sortBy: req.query.sortBy as any,
            sortOrder: req.query.sortOrder as any,
        };

        const result = await courseService.getAllCourses(filter, pagination, false);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get course by slug (public)
     * @route   GET /api/v1/courses/slug/:slug
     * @access  Public
     */
    getCourseBySlug: catchAsync(async (req, res) => {
        const { slug } = req.params;
        const result = await courseService.getCourseBySlug(slug, false);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get course by ID (public - published only)
     * @route   GET /api/v1/courses/:id
     * @access  Public
     */
    getCourseById: catchAsync(async (req, res) => {
        const { id } = req.params;
        const result = await courseService.getCourseById(id, false);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get featured courses
     * @route   GET /api/v1/courses/featured
     * @access  Public
     */
    getFeaturedCourses: catchAsync(async (req, res) => {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const result = await courseService.getFeaturedCourses(limit);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get courses by category
     * @route   GET /api/v1/courses/category/:categoryId
     * @access  Public
     */
    getCoursesByCategory: catchAsync(async (req, res) => {
        const { categoryId } = req.params;
        const pagination: CoursePaginationDTO = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
        };
        const result = await courseService.getCoursesByCategory(categoryId, pagination);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    // ==================== INSTRUCTOR ROUTES ====================

    /**
     * @desc    Create a new course
     * @route   POST /api/v1/courses
     * @access  Private (Instructor, Admin)
     */
    createCourse: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const result = await courseService.createCourse(req.body, userId);
        sendResponse(res, STATUSCODE.CREATED, result.message, result.data);
    }),

    /**
     * @desc    Get my courses (instructor's own courses)
     * @route   GET /api/v1/courses/my-courses
     * @access  Private (Instructor)
     */
    getMyCourses: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const result = await courseService.getMyCourses(userId);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get instructor metrics for dashboard
     * @route   GET /api/v1/courses/instructor/metrics
     * @access  Private (Instructor)
     */
    getInstructorMetrics: catchAsync(async (req, res) => {
        const userId = req.user!.id;
        const result = await courseService.getInstructorMetrics(userId);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Get course by ID (including unpublished - owner only)
     * @route   GET /api/v1/courses/manage/:id
     * @access  Private (Owner, Admin)
     */
    getCourseForManagement: catchAsync(async (req, res) => {
        const { id } = req.params;
        const result = await courseService.getCourseById(id, true);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Update course
     * @route   PUT /api/v1/courses/:id
     * @access  Private (Owner, Admin)
     */
    updateCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const isAdmin = req.user?.roleName === "admin";
        const result = await courseService.updateCourse(id, req.body, userId, isAdmin);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Delete course (soft delete)
     * @route   DELETE /api/v1/courses/:id
     * @access  Private (Owner, Admin)
     */
    deleteCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const isAdmin = req.user?.roleName === "admin";
        const result = await courseService.deleteCourse(id, userId, isAdmin);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Submit course for review
     * @route   POST /api/v1/courses/:id/submit-review
     * @access  Private (Owner)
     */
    submitForReview: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await courseService.submitForReview(id, userId);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Publish course (owner or admin)
     * @route   POST /api/v1/courses/:id/publish
     * @access  Private (Owner with permission, Admin)
     */
    publishCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const isAdmin = req.user?.roleName === "admin";
        const result = await courseService.publishCourse(id, userId, isAdmin);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Unpublish course
     * @route   POST /api/v1/courses/:id/unpublish
     * @access  Private (Owner, Admin)
     */
    unpublishCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const isAdmin = req.user?.roleName === "admin";
        const result = await courseService.unpublishCourse(id, userId, isAdmin);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    // ==================== ADMIN ROUTES ====================

    /**
     * @desc    Get all courses (including unpublished - admin view)
     * @route   GET /api/v1/courses/admin/all
     * @access  Private (Admin, Manager)
     */
    getAllCoursesAdmin: catchAsync(async (req, res) => {
        const filter: CourseFilterDTO = {
            category: req.query.category as string,
            level: req.query.level as any,
            status: req.query.status as any,
            instructor: req.query.instructor as string,
            isFeatured: req.query.isFeatured === "true",
            search: req.query.search as string,
        };

        const pagination: CoursePaginationDTO = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            sortBy: req.query.sortBy as any,
            sortOrder: req.query.sortOrder as any,
        };

        const result = await courseService.getAllCourses(filter, pagination, true);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),

    /**
     * @desc    Approve course (after review)
     * @route   POST /api/v1/courses/:id/approve
     * @access  Private (Admin, Manager)
     */
    approveCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await courseService.approveCourse(id, userId);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Reject course
     * @route   POST /api/v1/courses/:id/reject
     * @access  Private (Admin, Manager)
     */
    rejectCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const { reason } = req.body;
        const result = await courseService.rejectCourse(id, userId, reason);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Toggle featured status
     * @route   POST /api/v1/courses/:id/toggle-featured
     * @access  Private (Admin)
     */
    toggleFeatured: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await courseService.toggleFeatured(id, userId);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Permanently delete course
     * @route   DELETE /api/v1/courses/:id/permanent
     * @access  Private (Admin only)
     */
    hardDeleteCourse: catchAsync(async (req, res) => {
        const { id } = req.params;
        const userId = req.user!.id;
        const result = await courseService.hardDeleteCourse(id, userId);
        sendResponse(res, STATUSCODE.OK, result.message, result.data);
    }),

    /**
     * @desc    Get instructor's courses (admin view)
     * @route   GET /api/v1/courses/instructor/:instructorId
     * @access  Private (Admin, Manager)
     */
    getInstructorCourses: catchAsync(async (req, res) => {
        const { instructorId } = req.params;
        const requesterId = req.user!.id;
        const result = await courseService.getInstructorCourses(instructorId, requesterId, true);
        sendResponse(res, STATUSCODE.OK, SUCCESS_CODE.SUCCESS, result.data);
    }),
};

export default courseController;

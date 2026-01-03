import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { courseRepository } from "src/repositories/course.repository.js";
import { categoryRepository } from "src/repositories/category.repository.js";
import type {
    ICourse,
    IChapter,
    ILesson,
    ILessonContent,
    CreateCourseDTO,
    UpdateCourseDTO,
    CourseFilterDTO,
    CoursePaginationDTO,
} from "src/types/course.type.js";
import { CourseStatus, Currency } from "src/types/course.type.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";

const courseService = {
    // ==================== CREATE COURSE ====================
    createCourse: async (data: CreateCourseDTO, userId: string) => {
        // Validate category is a valid ObjectId
        if (data.category && !Types.ObjectId.isValid(data.category)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "category", message: "Category must be a valid ID" }]
            );
        }

        // Validate subCategory if provided
        if (data.subCategory && !Types.ObjectId.isValid(data.subCategory)) {
            throw new AppError(
                "Invalid subcategory ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "subCategory", message: "Subcategory must be a valid ID" }]
            );
        }

        // If category is provided, verify it exists
        if (data.category) {
            const categoryExists = await categoryRepository.exists(data.category);
            if (!categoryExists) {
                throw new AppError(
                    "Category not found",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.VALIDATION_ERROR,
                    [{ path: "category", message: "Selected category does not exist" }]
                );
            }
        }

        // If subCategory is provided, validate it belongs to the category
        if (data.subCategory) {
            if (!data.category) {
                throw new AppError(
                    "Category required for subcategory",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.VALIDATION_ERROR,
                    [{ path: "category", message: "Category must be selected when using subcategory" }]
                );
            }

            const isValidSubcategory = await categoryRepository.validateSubcategory(
                data.category,
                data.subCategory
            );
            if (!isValidSubcategory) {
                throw new AppError(
                    "Invalid subcategory",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.VALIDATION_ERROR,
                    [{ path: "subCategory", message: "Subcategory does not belong to the selected category" }]
                );
            }
        }

        // Generate unique slug
        const baseSlug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .substring(0, 100);

        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        // Calculate final price
        const originalPrice = data.originalPrice || 0;
        const discountPercentage = data.discountPercentage || 0;
        const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

        const courseData: Partial<ICourse> = {
            title: data.title,
            slug,
            subtitle: data.subtitle,
            description: data.description,
            shortDescription: data.shortDescription,
            coverImage: data.coverImage,
            previewVideoUrl: data.previewVideoUrl,
            category: data.category ? new Types.ObjectId(data.category) : undefined,
            subCategory: data.subCategory ? new Types.ObjectId(data.subCategory) : undefined,
            tags: data.tags || [],
            level: data.level,
            language: data.language || "English",
            deliveryMode: data.deliveryMode,
            location: data.location,
            accessDuration: data.accessDuration || 365,
            pricing: {
                originalPrice,
                discountPercentage,
                finalPrice,
                currency: data.currency || Currency.INR,
                isGstApplicable: data.isGstApplicable ?? true,
                gstPercentage: 18,
            },
            instructor: new Types.ObjectId(data.instructor || userId),
            coInstructors: data.coInstructors?.map((id) => new Types.ObjectId(id)),
            status: CourseStatus.DRAFT,
            isPublished: false,
            isFeatured: false,
        };

        const course = await courseRepository.create(courseData);

        logger.info(`Course created: ${course._id} by user: ${userId}`);

        return {
            message: "Course created successfully",
            data: {
                course: {
                    _id: course._id,
                    title: course.title,
                    slug: course.slug,
                    status: course.status,
                },
            },
        };
    },

    // ==================== GET COURSE BY ID ====================
    getCourseById: async (courseId: string, includeUnpublished = false) => {
        if (!Types.ObjectId.isValid(courseId)) {
            throw new AppError(
                "Invalid course ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const course = await courseRepository.findByIdPopulated(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "courseId", message: "No course found with the given ID" }]
            );
        }

        // If not including unpublished, check status
        if (!includeUnpublished && !course.isPublished) {
            throw new AppError(
                "Course not available",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "courseId", message: "This course is not published yet" }]
            );
        }

        return {
            message: "Course fetched successfully",
            data: { course },
        };
    },

    // ==================== GET COURSE BY SLUG ====================
    getCourseBySlug: async (slug: string, includeUnpublished = false) => {
        const course = includeUnpublished
            ? await courseRepository.findBySlug(slug)
            : await courseRepository.findPublishedBySlug(slug);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "slug", message: "No course found with the given slug" }]
            );
        }

        return {
            message: "Course fetched successfully",
            data: { course },
        };
    },

    // ==================== GET ALL COURSES ====================
    getAllCourses: async (
        filter: CourseFilterDTO = {},
        pagination: CoursePaginationDTO = {},
        isAdmin = false
    ) => {
        // If not admin, only show published courses
        if (!isAdmin) {
            filter.status = CourseStatus.PUBLISHED;
        }

        const result = await courseRepository.findAll(filter, pagination);

        return {
            message: "Courses fetched successfully",
            data: {
                courses: result.courses,
                pagination: result.pagination,
            },
        };
    },

    // ==================== GET PUBLISHED COURSES ====================
    getPublishedCourses: async (pagination: CoursePaginationDTO = {}) => {
        const result = await courseRepository.findPublished(pagination);

        return {
            message: "Published courses fetched successfully",
            data: {
                courses: result.courses,
                pagination: result.pagination,
            },
        };
    },

    // ==================== GET FEATURED COURSES ====================
    getFeaturedCourses: async (limit = 10) => {
        const courses = await courseRepository.findFeatured(limit);

        return {
            message: "Featured courses fetched successfully",
            data: { courses },
        };
    },

    // ==================== GET INSTRUCTOR COURSES ====================
    getInstructorCourses: async (instructorId: string, requesterId: string, isAdmin = false) => {
        // Allow if admin or if requesting own courses
        const includeUnpublished = isAdmin || instructorId === requesterId;

        const [courses, stats] = await Promise.all([
            courseRepository.findByInstructor(instructorId, includeUnpublished),
            courseRepository.getInstructorStats(instructorId),
        ]);

        return {
            message: "Instructor courses fetched successfully",
            data: {
                courses,
                stats,
            },
        };
    },

    // ==================== GET MY COURSES (Instructor) ====================
    getMyCourses: async (userId: string) => {
        const [courses, stats] = await Promise.all([
            courseRepository.findByInstructor(userId, true), // Include unpublished
            courseRepository.getInstructorStats(userId),
        ]);

        return {
            message: "Your courses fetched successfully",
            data: {
                courses,
                stats,
            },
        };
    },

    // ==================== GET INSTRUCTOR METRICS ====================
    getInstructorMetrics: async (userId: string) => {
        const metrics = await courseRepository.getInstructorMetrics(userId);

        return {
            message: "Instructor metrics fetched successfully",
            data: {
                metrics,
            },
        };
    },

    // ==================== GET COURSES BY CATEGORY ====================
    getCoursesByCategory: async (categoryId: string, pagination: CoursePaginationDTO = {}) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const result = await courseRepository.findByCategory(categoryId, pagination);

        return {
            message: "Courses fetched successfully",
            data: {
                courses: result.courses,
                pagination: result.pagination,
            },
        };
    },

    // ==================== UPDATE COURSE ====================
    updateCourse: async (
        courseId: string,
        data: UpdateCourseDTO,
        userId: string,
        isAdmin = false
    ) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check ownership (unless admin)
        if (!isAdmin) {
            const isOwner = await courseRepository.isOwner(courseId, userId);
            if (!isOwner) {
                throw new AppError(
                    "You don't have permission to update this course",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }
        }

        // Prepare update data
        const updateData: Partial<ICourse> = {};

        if (data.title) updateData.title = data.title;
        if (data.subtitle) updateData.subtitle = data.subtitle;
        if (data.description) updateData.description = data.description;
        if (data.shortDescription) updateData.shortDescription = data.shortDescription;
        if (data.coverImage) updateData.coverImage = data.coverImage;
        if (data.previewVideoUrl) updateData.previewVideoUrl = data.previewVideoUrl;
        if (data.category) updateData.category = new Types.ObjectId(data.category);
        if (data.subCategory) updateData.subCategory = new Types.ObjectId(data.subCategory);
        if (data.tags) updateData.tags = data.tags;
        if (data.level) updateData.level = data.level;
        if (data.language) updateData.language = data.language;
        if (data.deliveryMode) updateData.deliveryMode = data.deliveryMode;
        if (data.location) updateData.location = data.location;
        if (data.accessDuration) updateData.accessDuration = data.accessDuration;
        if (data.curriculum) updateData.curriculum = data.curriculum;

        // Update pricing if provided
        if (data.originalPrice !== undefined || data.discountPercentage !== undefined) {
            const originalPrice = data.originalPrice ?? course.pricing.originalPrice;
            const discountPercentage = data.discountPercentage ?? course.pricing.discountPercentage;
            const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

            updateData.pricing = {
                ...course.pricing,
                originalPrice,
                discountPercentage,
                finalPrice,
                currency: data.currency ?? course.pricing.currency,
                isGstApplicable: data.isGstApplicable ?? course.pricing.isGstApplicable,
            };
        }

        // Admin-only fields
        if (isAdmin) {
            if (data.status) updateData.status = data.status;
            if (typeof data.isFeatured === "boolean") updateData.isFeatured = data.isFeatured;
        }

        const updatedCourse = await courseRepository.updateById(courseId, updateData);

        logger.info(`Course updated: ${courseId} by user: ${userId}`);

        return {
            message: "Course updated successfully",
            data: { course: updatedCourse },
        };
    },

    // ==================== DELETE COURSE ====================
    deleteCourse: async (courseId: string, userId: string, isAdmin = false) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check ownership (unless admin)
        if (!isAdmin) {
            const isOwner = await courseRepository.isOwner(courseId, userId);
            if (!isOwner) {
                throw new AppError(
                    "You don't have permission to delete this course",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }
        }

        // Soft delete (archive) instead of hard delete
        await courseRepository.softDeleteById(courseId);

        logger.info(`Course archived: ${courseId} by user: ${userId}`);

        return {
            message: "Course deleted successfully",
            data: { courseId },
        };
    },

    // ==================== HARD DELETE COURSE (Admin only) ====================
    hardDeleteCourse: async (courseId: string, userId: string) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        await courseRepository.deleteById(courseId);

        logger.warn(`Course permanently deleted: ${courseId} by admin: ${userId}`);

        return {
            message: "Course permanently deleted",
            data: { courseId },
        };
    },

    // ==================== PUBLISH COURSE ====================
    publishCourse: async (courseId: string, userId: string, isAdmin = false) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check ownership or admin
        if (!isAdmin) {
            const isOwner = await courseRepository.isOwner(courseId, userId);
            if (!isOwner) {
                throw new AppError(
                    "You don't have permission to publish this course",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }
        }

        // Validate course has minimum required content
        if (!course.curriculum || course.curriculum.length === 0) {
            throw new AppError(
                "Course must have at least one chapter before publishing",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const updatedCourse = await courseRepository.publishCourse(courseId);

        logger.info(`Course published: ${courseId} by user: ${userId}`);

        return {
            message: "Course published successfully",
            data: { course: updatedCourse },
        };
    },

    // ==================== UNPUBLISH COURSE ====================
    unpublishCourse: async (courseId: string, userId: string, isAdmin = false) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check ownership or admin
        if (!isAdmin) {
            const isOwner = await courseRepository.isOwner(courseId, userId);
            if (!isOwner) {
                throw new AppError(
                    "You don't have permission to unpublish this course",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }
        }

        const updatedCourse = await courseRepository.unpublishCourse(courseId);

        logger.info(`Course unpublished: ${courseId} by user: ${userId}`);

        return {
            message: "Course unpublished successfully",
            data: { course: updatedCourse },
        };
    },

    // ==================== SUBMIT FOR REVIEW ====================
    submitForReview: async (courseId: string, userId: string) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        const isOwner = await courseRepository.isOwner(courseId, userId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to submit this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Validate minimum requirements
        if (!course.curriculum || course.curriculum.length === 0) {
            throw new AppError(
                "Course must have at least one chapter before submission",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const updatedCourse = await courseRepository.submitForReview(courseId);

        logger.info(`Course submitted for review: ${courseId} by user: ${userId}`);

        return {
            message: "Course submitted for review",
            data: { course: updatedCourse },
        };
    },

    // ==================== APPROVE COURSE (Admin/Manager) ====================
    approveCourse: async (courseId: string, userId: string) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        if (course.status !== CourseStatus.PENDING_REVIEW) {
            throw new AppError(
                "Only courses pending review can be approved",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const updatedCourse = await courseRepository.publishCourse(courseId);

        logger.info(`Course approved and published: ${courseId} by admin: ${userId}`);

        return {
            message: "Course approved and published",
            data: { course: updatedCourse },
        };
    },

    // ==================== REJECT COURSE (Admin/Manager) ====================
    rejectCourse: async (courseId: string, userId: string, reason?: string) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        const updatedCourse = await courseRepository.rejectCourse(courseId);

        logger.info(`Course rejected: ${courseId} by admin: ${userId}. Reason: ${reason || "Not specified"}`);

        return {
            message: "Course rejected",
            data: { course: updatedCourse },
        };
    },

    // ==================== TOGGLE FEATURED ====================
    toggleFeatured: async (courseId: string, userId: string) => {
        const course = await courseRepository.findById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        const updatedCourse = await courseRepository.toggleFeatured(courseId);

        logger.info(
            `Course featured status toggled: ${courseId} to ${updatedCourse?.isFeatured} by admin: ${userId}`
        );

        return {
            message: `Course ${updatedCourse?.isFeatured ? "marked as featured" : "removed from featured"}`,
            data: { course: updatedCourse },
        };
    },
};

export default courseService;

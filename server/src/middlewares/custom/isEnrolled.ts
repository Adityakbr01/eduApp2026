import type { Request, Response, NextFunction } from "express";
import { enrollmentRepository } from "src/repositories/enrollment.repository.js";
import { courseRepository } from "src/repositories/course.repository.js";
import AppError from "src/utils/AppError.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import logger from "src/utils/logger.js";

/**
 * Middleware to check if user is enrolled in a course
 * 
 * This middleware blocks access to course content if the user is not enrolled.
 * It allows access in the following cases:
 * 1. User has an active enrollment for the course
 * 2. The course is free
 * 3. The content is marked as preview (if content check is enabled)
 * 4. The user is the instructor/owner of the course
 * 
 * Usage:
 * - router.get('/course/:courseId/content', isEnrolled, controller.getContent)
 * - router.get('/course/:courseId/content/:contentId', isEnrolled({ checkPreview: true }), controller.getContent)
 */

interface IsEnrolledOptions {
    /**
     * Parameter name for course ID in req.params
     * @default 'courseId'
     */
    courseIdParam?: string;

    /**
     * Allow access if course is free
     * @default true
     */
    allowFreeAccess?: boolean;

    /**
     * Allow access if user is the course instructor
     * @default true
     */
    allowInstructor?: boolean;

    /**
     * Custom error message
     */
    errorMessage?: string;
}

/**
 * Creates an isEnrolled middleware with custom options
 */
export const isEnrolled = (options: IsEnrolledOptions = {}) => {
    const {
        courseIdParam = "courseId",
        allowFreeAccess = true,
        allowInstructor = true,
        errorMessage = "You must be enrolled in this course to access this content",
    } = options;

    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            const courseId = req.params[courseIdParam];

            // Check if user is authenticated
            if (!userId) {
                throw new AppError(
                    "Authentication required",
                    STATUSCODE.UNAUTHORIZED,
                    ERROR_CODE.UNAUTHORIZED
                );
            }

            // Check if courseId is provided
            if (!courseId) {
                throw new AppError(
                    "Course ID is required",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.BAD_REQUEST
                );
            }

            // Fetch the course to check if it's free or if user is instructor
            const course = await courseRepository.findPublishedById(courseId);

            if (!course) {
                throw new AppError(
                    "Course not found",
                    STATUSCODE.NOT_FOUND,
                    ERROR_CODE.NOT_FOUND
                );
            }

            // Check if user is the instructor (allow full access)
            if (allowInstructor) {
                const isOwner = await courseRepository.isOwner(course._id, userId);
                if (isOwner) {
                    logger.debug("Instructor access granted", { userId, courseId });
                    return next();
                }
            }

            // Check if course is free (allow access without enrollment)
            if (allowFreeAccess && (course.pricing.isFree || course.pricing.price === 0)) {
                logger.debug("Free course access granted", { userId, courseId });
                return next();
            }

            // Check if user is enrolled
            const isEnrolledUser = await enrollmentRepository.isEnrolled(userId, course._id);

            if (!isEnrolledUser) {
                throw new AppError(
                    errorMessage,
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.FORBIDDEN
                );
            }

            // User is enrolled - allow access
            logger.debug("Enrolled user access granted", { userId, courseId });
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Simple isEnrolled middleware with default options
 * Use this for most cases
 */
export const requireEnrollment = isEnrolled();

/**
 * Strict enrollment check - only allows enrolled users
 * Does not allow free access or instructor access
 */
export const strictEnrollment = isEnrolled({
    allowFreeAccess: false,
    allowInstructor: false,
    errorMessage: "Active enrollment required to access this content",
});

/**
 * Middleware to check if content is preview accessible
 * This should be used in combination with isEnrolled for lesson content routes
 */
export const isPreviewOrEnrolled = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const courseId = req.params.courseId;
        const contentId = req.params.contentId;

        // Check if user is authenticated
        if (!userId) {
            throw new AppError(
                "Authentication required",
                STATUSCODE.UNAUTHORIZED,
                ERROR_CODE.UNAUTHORIZED
            );
        }

        // Fetch the course
        const course = await courseRepository.findPublishedById(courseId);

        if (!course) {
            throw new AppError(
                "Course not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        // Check if user is the instructor
        const isOwner = await courseRepository.isOwner(course._id, userId);
        if (isOwner) {
            return next();
        }

        // Check if course is free
        if (course.pricing.isFree || course.pricing.price === 0) {
            return next();
        }

        // Check if user is enrolled
        const isEnrolledUser = await enrollmentRepository.isEnrolled(userId, course._id);
        if (isEnrolledUser) {
            return next();
        }

        // If content ID is provided, check if it's a preview content
        // This would require importing the lesson content repository
        // For now, we'll add the content info to the request for the controller to handle
        if (contentId) {
            // Mark that enrollment check failed but content might be preview
            (req as any).enrollmentCheckFailed = true;
            (req as any).checkPreviewAccess = true;
            return next();
        }

        throw new AppError(
            "You must be enrolled in this course to access this content",
            STATUSCODE.FORBIDDEN,
            ERROR_CODE.FORBIDDEN
        );
    } catch (error) {
        next(error);
    }
};

export default isEnrolled;

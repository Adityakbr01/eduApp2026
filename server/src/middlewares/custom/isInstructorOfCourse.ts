import type { NextFunction, Request, Response } from "express";
import { ROLES } from "src/constants/roles.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";
import Course from "src/models/course/course.model.js";
import logger from "src/utils/logger.js";

/**
 * Middleware: Validates the current user is the instructor (or co-instructor) of the course.
 * Checks `req.body.courseId` or `req.params.courseId`.
 * Allows ADMIN override.
 */
const isInstructorOfCourse = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const roleName = req.user?.roleName;

        // Admin bypass
        if (roleName === ROLES.ADMIN.code) {
            return next();
        }

        const courseId = req.body.courseId || req.params.courseId;

        if (!courseId) {
            return next(
                new AppError(
                    "Course ID is required",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.BAD_REQUEST,
                    [{ path: "courseId", message: "Course ID is required" }]
                )
            );
        }

        const course = await Course.findById(courseId)
            .select("instructor coInstructors")
            .lean();

        if (!course) {
            return next(
                new AppError(
                    "Course not found",
                    STATUSCODE.NOT_FOUND,
                    ERROR_CODE.NOT_FOUND,
                    [{ path: "courseId", message: "Course not found" }]
                )
            );
        }

        const isOwner = String(course.instructor) === userId;
        const isCoInstructor = course.coInstructors?.some(
            (coId: any) => String(coId) === userId
        );

        if (!isOwner && !isCoInstructor) {
            logger.warn("⛔ User is not instructor of course", {
                userId,
                courseId,
            });
            return next(
                new AppError(
                    "You are not the instructor of this course",
                    STATUSCODE.FORBIDDEN,
                    ERROR_CODE.NOT_COURSE_INSTRUCTOR,
                    [{ path: "courseId", message: "Not the instructor of this course" }]
                )
            );
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default isInstructorOfCourse;

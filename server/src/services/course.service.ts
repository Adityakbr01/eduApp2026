import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import CourseStatusRequestSchema from "src/models/course/CourseStatusRequestSchema.js";
import {
    contentAttemptRepository,
    courseRepository,
    lessonContentRepository,
    lessonRepository,
    sectionRepository,
} from "src/repositories/course.repository.js";
import { CourseStatus } from "src/types/course.type.js";
import AppError from "src/utils/AppError.js";
import generateSlug from "src/utils/generateSlug.js";


// ============================================
// COURSE SERVICE
// ============================================
export const courseService = {
    // -------------------- GET ALL PUBLISHED COURSES --------------------
    getAllPublishedCourses: async (query: { page?: number; limit?: number; search?: string; category?: string }) => {
        return courseRepository.findAllPublished(query);
    },

    // -------------------- GET PUBLISHED COURSE BY ID --------------------
    getPublishedCourseById: async (courseId: string) => {
        const course = await courseRepository.findPublishedById(courseId);

        if (!course) {
            throw new AppError("Published course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return course;
    },

    // -------------------- CREATE COURSE --------------------
    createCourse: async (instructorId: string, data: any) => {
        // Generate unique slug
        let slug = generateSlug(data.title);
        const existingSlug = await courseRepository.slugExists(slug);
        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        const courseData = {
            ...data,
            slug,
            instructor: instructorId,
        };

        const course = await courseRepository.create(courseData);
        return course;
    },

    // -------------------- GET INSTRUCTOR COURSES --------------------
    getInstructorCourses: async (
        instructorId: string,
        query: { page?: number; limit?: number; status?: string; search?: string }
    ) => {
        return courseRepository.findByInstructor(instructorId, query);
    },

    // -------------------- GET COURSE BY ID --------------------
    getCourseById: async (courseId: string, instructorId: string) => {
        const course = await courseRepository.findByIdWithDetails(courseId);

        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check ownership
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to access this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return course;
    },

    // -------------------- UPDATE COURSE --------------------
    updateCourse: async (courseId: string, instructorId: string, data: any) => {
        // Check ownership
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // If title is being updated, regenerate slug
        if (data.title) {
            let slug = generateSlug(data.title);
            const existingSlug = await courseRepository.slugExists(slug, courseId);
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }
            data.slug = slug;
        }

        const course = await courseRepository.updateById(courseId, data);

        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return course;
    },

    // -------------------- DELETE COURSE --------------------
    deleteCourse: async (courseId: string, instructorId: string) => {
        // Check ownership
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to delete this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Delete all related data
        await Promise.all([
            lessonContentRepository.deleteByCourse(courseId),
            lessonRepository.deleteByCourse(courseId),
            sectionRepository.deleteByCourse(courseId),
            contentAttemptRepository.deleteByCourse(courseId),
        ]);

        const course = await courseRepository.deleteById(courseId);

        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return { message: "Course deleted successfully" };
    },

    // -------------------- PUBLISH/ UNPUBLISH COURSE with admin Approval--------------------
     // -------------------- SUBMIT COURSE STATUS REQUEST (INSTRUCTOR) --------------------
submitCourseStatusRequest: async (
  courseId: string,
  instructorId: string,
  type: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED
) => {
  const isOwner = await courseRepository.isOwner(courseId, instructorId);
  if (!isOwner) {
    throw new AppError("Not course owner", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }

  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }

  // ✅ Validate transitions
  if (
    type === CourseStatus.PUBLISHED &&
    ![CourseStatus.DRAFT, CourseStatus.REJECTED].includes(course.status)
  ) {
    throw new AppError(
      "Course cannot be submitted for publishing",
      STATUSCODE.BAD_REQUEST,
      ERROR_CODE.INVALID_ACTION
    );
  }

  if (
    type === CourseStatus.UNPUBLISHED &&
    course.status !== CourseStatus.PUBLISHED
  ) {
    throw new AppError(
      "Only published courses can be requested for unpublishing",
      STATUSCODE.BAD_REQUEST,
      ERROR_CODE.INVALID_ACTION
    );
  }

  // ✅ Prevent duplicate pending requests
  const existingRequest = await CourseStatusRequestSchema.findOne({
    course: courseId,
    status: CourseStatus.PENDING_REVIEW,
  });

  if (existingRequest) {
    throw new AppError(
      "A request is already pending review",
      STATUSCODE.CONFLICT,
      ERROR_CODE.DUPLICATE_ENTRY
    );
  }

  // ✅ Mark course as pending review (important!)
  await courseRepository.updatePublishStatus(courseId, CourseStatus.PENDING_REVIEW);

  return CourseStatusRequestSchema.create({
    course: courseId,
    instructor: instructorId,
    type,
  });
},
   // -------------------- GET COURSE for admin with pagination and filtering with regex --------------------
    getCoursesForAdmin: async (query: { page?: number; limit?: number; status?: string; search?: string }) => {
        return courseRepository.findForAdmin(query);
    },
  // -------------------- ADMIN APPROVE / REJECT COURSE REQUEST --------------------
toggleCourseStatusAdmin: async (
  requestId: string,
  action: CourseStatus.APPROVED | CourseStatus.REJECTED,
  adminId: string,
  reason?: string
) => {
  const request = await CourseStatusRequestSchema.findById(requestId);
  if (!request) {
    throw new AppError("Request not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }

  if (request.status !== CourseStatus.PENDING_REVIEW) {
    throw new AppError(
      "Request already processed",
      STATUSCODE.BAD_REQUEST,
      ERROR_CODE.INVALID_ACTION
    );
  }

  const course = await courseRepository.findById(request.course.toString());
  if (!course) {
    throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }

  if (action === CourseStatus.APPROVED) {
    // ✅ Apply requested change
    if (request.type === CourseStatus.PUBLISHED) {
      await courseRepository.updatePublishStatus(course._id, CourseStatus.PUBLISHED);
    }

    if (request.type === CourseStatus.UNPUBLISHED) {
      await courseRepository.updatePublishStatus(course._id, CourseStatus.DRAFT);
    }

    request.status = CourseStatus.APPROVED;
  } else {
    // ❌ Reject → revert course to safe state
    request.status = CourseStatus.REJECTED;
    request.reason = reason;

    await courseRepository.updatePublishStatus(
      course._id,
      request.type === CourseStatus.PUBLISHED
        ? CourseStatus.DRAFT
        : CourseStatus.PUBLISHED
    );
  }
request.admin = new Types.ObjectId(adminId);
  request.reviewedAt = new Date();
  await request.save();

  return request;
},
};







export default {
    courseService
};
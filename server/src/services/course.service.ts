import { Types } from "mongoose";

// Utility function to generate slug
const generateSlug = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import {
    courseRepository,
    sectionRepository,
    lessonRepository,
    lessonContentRepository,
    contentAttemptRepository,
} from "src/repositories/course.repository.js";
import AppError from "src/utils/AppError.js";
import Course from "src/models/course/course.model.js";
import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import mongoose from "mongoose";

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

    // -------------------- PUBLISH COURSE --------------------
    publishCourse: async (courseId: string, instructorId: string) => {
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to publish this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Validate course has required content
        const sections = await sectionRepository.findByCourse(courseId);
        if (sections.length === 0) {
            throw new AppError(
                "Course must have at least one section to publish",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR
            );
        }

        const course = await courseRepository.updatePublishStatus(courseId, true);
        return course;
    },

    // -------------------- UNPUBLISH COURSE --------------------
    unpublishCourse: async (courseId: string, instructorId: string) => {
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to unpublish this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const course = await courseRepository.updatePublishStatus(courseId, false);
        return course;
    },
};

// ============================================
// SECTION SERVICE
// ============================================
export const sectionService = {
    // -------------------- CREATE SECTION --------------------
    createSection: async (courseId: string, instructorId: string, data: any) => {
        // Check course ownership
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to add sections to this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Get next order
        const maxOrder = await sectionRepository.getMaxOrder(courseId);

        const sectionData = {
            ...data,
            courseId,
            order: maxOrder + 1,
        };

        const section = await sectionRepository.create(sectionData);
        return section;
    },

    // -------------------- GET SECTIONS BY COURSE --------------------
    getSectionsByCourse: async (courseId: string, instructorId: string) => {
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to view sections of this course",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return sectionRepository.findByCourse(courseId);
    },

    // -------------------- UPDATE SECTION --------------------
    updateSection: async (sectionId: string, instructorId: string, data: any) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update this section",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return sectionRepository.updateById(sectionId, data);
    },

    // -------------------- DELETE SECTION --------------------
    deleteSection: async (sectionId: string, instructorId: string) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to delete this section",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Delete all lessons and their contents in this section
        const lessons = await lessonRepository.findBySection(sectionId);
        const lessonIds = lessons.map((l: any) => l._id);

        await Promise.all([
            LessonContent.deleteMany({ lessonId: { $in: lessonIds } }),
            lessonRepository.deleteBySection(sectionId),
        ]);

        await sectionRepository.deleteById(sectionId);
        return { message: "Section deleted successfully" };
    },

    // -------------------- REORDER SECTIONS --------------------
    reorderSections: async (
        courseId: string,
        instructorId: string,
        sections: { id: string; order: number }[]
    ) => {
        const isOwner = await courseRepository.isOwner(courseId, instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to reorder sections",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        await sectionRepository.bulkReorder(sections);
        return sectionRepository.findByCourse(courseId);
    },

    // -------------------- TOGGLE SECTION VISIBILITY --------------------
    toggleVisibility: async (sectionId: string, instructorId: string) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update visibility",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return sectionRepository.toggleVisibility(sectionId);
    },
};

// ============================================
// LESSON SERVICE
// ============================================
export const lessonService = {
    // -------------------- CREATE LESSON --------------------
    createLesson: async (sectionId: string, instructorId: string, data: any) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to add lessons",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const maxOrder = await lessonRepository.getMaxOrder(sectionId);

        const lessonData = {
            ...data,
            sectionId,
            courseId: section.courseId,
            order: maxOrder + 1,
        };

        return lessonRepository.create(lessonData);
    },

    // -------------------- GET LESSONS BY SECTION --------------------
    getLessonsBySection: async (sectionId: string, instructorId: string) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to view lessons",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return lessonRepository.findBySection(sectionId);
    },

    // -------------------- UPDATE LESSON --------------------
    updateLesson: async (lessonId: string, instructorId: string, data: any) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update this lesson",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return lessonRepository.updateById(lessonId, data);
    },

    // -------------------- DELETE LESSON --------------------
    deleteLesson: async (lessonId: string, instructorId: string) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to delete this lesson",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Delete all contents in this lesson
        await lessonContentRepository.deleteByLesson(lessonId);
        await lessonRepository.deleteById(lessonId);

        return { message: "Lesson deleted successfully" };
    },

    // -------------------- REORDER LESSONS --------------------
    reorderLessons: async (
        sectionId: string,
        instructorId: string,
        lessons: { id: string; order: number }[]
    ) => {
        const section = await sectionRepository.findById(sectionId);
        if (!section) {
            throw new AppError("Section not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(section.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to reorder lessons",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        await lessonRepository.bulkReorder(lessons);
        return lessonRepository.findBySection(sectionId);
    },

    // -------------------- TOGGLE LESSON VISIBILITY --------------------
    toggleVisibility: async (lessonId: string, instructorId: string) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update visibility",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return lessonRepository.toggleVisibility(lessonId);
    },
};

// ============================================
// LESSON CONTENT SERVICE
// ============================================
export const lessonContentService = {
    // -------------------- CREATE CONTENT --------------------
    createContent: async (lessonId: string, instructorId: string, data: any) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to add content",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        const maxOrder = await lessonContentRepository.getMaxOrder(lessonId);

        const contentData = {
            ...data,
            lessonId,
            courseId: lesson.courseId,
            order: maxOrder + 1,
        };

        return lessonContentRepository.create(contentData);
    },

    // -------------------- GET CONTENTS BY LESSON --------------------
    getContentsByLesson: async (lessonId: string, instructorId: string) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to view contents",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return lessonContentRepository.findByLesson(lessonId);
    },

    // -------------------- UPDATE CONTENT --------------------
    updateContent: async (contentId: string, instructorId: string, data: any) => {
        console.log("Updating content:", contentId, data);
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(content.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update this content",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }
        return lessonContentRepository.updateById(contentId, data);
    },

    // -------------------- DELETE CONTENT --------------------
    deleteContent: async (contentId: string, instructorId: string) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(content.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to delete this content",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        // Delete all attempts for this content
        await contentAttemptRepository.deleteByContent(contentId);
        await lessonContentRepository.deleteById(contentId);

        return { message: "Content deleted successfully" };
    },

    // -------------------- REORDER CONTENTS --------------------
    reorderContents: async (
        lessonId: string,
        instructorId: string,
        contents: { id: string; order: number }[]
    ) => {
        const lesson = await lessonRepository.findById(lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(lesson.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to reorder contents",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        await lessonContentRepository.bulkReorder(contents);
        return lessonContentRepository.findByLesson(lessonId);
    },

    // -------------------- TOGGLE CONTENT VISIBILITY --------------------
    toggleVisibility: async (contentId: string, instructorId: string) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const isOwner = await courseRepository.isOwner(content.courseId.toString(), instructorId);
        if (!isOwner) {
            throw new AppError(
                "You don't have permission to update visibility",
                STATUSCODE.FORBIDDEN,
                ERROR_CODE.FORBIDDEN
            );
        }

        return lessonContentRepository.toggleVisibility(contentId);
    },
};

// ============================================
// CONTENT PROGRESS SERVICE (STUDENT SIDE)
// ============================================
export const contentProgressService = {
    // -------------------- SAVE/UPDATE PROGRESS --------------------
    saveProgress: async (
        userId: string,
        contentId: string,
        data: {
            resumeAt?: number;
            totalDuration?: number;
            obtainedMarks?: number;
            isCompleted?: boolean;
        }
    ) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const progressData = {
            ...data,
            courseId: content.courseId,
            lessonId: content.lessonId,
            totalMarks: content.marks,
        };

        return contentAttemptRepository.upsert(userId, contentId, progressData);
    },

    // -------------------- GET PROGRESS --------------------
    getProgress: async (userId: string, contentId: string) => {
        return contentAttemptRepository.findByUserAndContent(userId, contentId);
    },

    // -------------------- MARK COMPLETED --------------------
    markCompleted: async (userId: string, contentId: string, obtainedMarks?: number) => {
        const content = await lessonContentRepository.findById(contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return contentAttemptRepository.markCompleted(userId, contentId, obtainedMarks);
    },

    // -------------------- UPDATE RESUME POSITION --------------------
    updateResumePosition: async (
        userId: string,
        contentId: string,
        resumeAt: number,
        totalDuration?: number
    ) => {
        return contentAttemptRepository.updateResumePosition(
            userId,
            contentId,
            resumeAt,
            totalDuration
        );
    },
};

// ============================================
// COURSE PROGRESS SERVICE (AGGREGATION API)
// ============================================
export const courseProgressService = {
    // -------------------- GET FULL COURSE WITH PROGRESS --------------------
    getCourseWithProgress: async (userId: string, courseId: string) => {
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Aggregation pipeline for full course structure with progress overlay
        const result = await Course.aggregate([
            // Match the specific course
            { $match: { _id: courseObjectId, isPublished: true } },

            // Lookup sections
            {
                $lookup: {
                    from: "sections",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$courseId", "$$courseId"] },
                                isVisible: true,
                            },
                        },
                        { $sort: { order: 1 } },

                        // Lookup lessons for each section
                        {
                            $lookup: {
                                from: "lessons",
                                let: { sectionId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$sectionId", "$$sectionId"] },
                                            isVisible: true,
                                        },
                                    },
                                    { $sort: { order: 1 } },

                                    // Lookup lesson contents
                                    {
                                        $lookup: {
                                            from: "lessoncontents",
                                            let: { lessonId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ["$lessonId", "$$lessonId"] },
                                                        isVisible: true,
                                                    },
                                                },
                                                { $sort: { order: 1 } },

                                                // Lookup user progress for each content
                                                {
                                                    $lookup: {
                                                        from: "contentattempts",
                                                        let: { contentId: "$_id" },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: {
                                                                        $and: [
                                                                            { $eq: ["$contentId", "$$contentId"] },
                                                                            { $eq: ["$userId", userObjectId] },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                        as: "progress",
                                                    },
                                                },

                                                // Flatten progress (single document)
                                                {
                                                    $addFields: {
                                                        userProgress: { $arrayElemAt: ["$progress", 0] },
                                                    },
                                                },
                                                { $project: { progress: 0 } },
                                            ],
                                            as: "contents",
                                        },
                                    },
                                ],
                                as: "lessons",
                            },
                        },
                    ],
                    as: "sections",
                },
            },

            // Calculate totals
            {
                $addFields: {
                    totalMarks: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $reduce: {
                                                            input: "$$this.contents",
                                                            initialValue: 0,
                                                            in: { $add: ["$$value", { $ifNull: ["$$this.marks", 0] }] },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    obtainedMarks: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $reduce: {
                                                            input: "$$this.contents",
                                                            initialValue: 0,
                                                            in: {
                                                                $add: [
                                                                    "$$value",
                                                                    { $ifNull: ["$$this.userProgress.obtainedMarks", 0] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    totalContents: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: { $add: ["$$value", { $size: "$$this.contents" }] },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedContents: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.userProgress.isCompleted", true] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    // Assignment counts
                    totalAssignments: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.type", "assignment"] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedAssignments: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$content.type", "assignment"] },
                                                                        { $eq: ["$$content.userProgress.isCompleted", true] },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    // Video counts
                    totalVideos: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.type", "video"] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedVideos: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$content.type", "video"] },
                                                                        { $eq: ["$$content.userProgress.isCompleted", true] },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // Calculate percentage
            {
                $addFields: {
                    progressPercentage: {
                        $cond: {
                            if: { $eq: ["$totalContents", 0] },
                            then: 0,
                            else: {
                                $multiply: [{ $divide: ["$completedContents", "$totalContents"] }, 100],
                            },
                        },
                    },
                    marksPercentage: {
                        $cond: {
                            if: { $eq: ["$totalMarks", 0] },
                            then: 0,
                            else: {
                                $multiply: [{ $divide: ["$obtainedMarks", "$totalMarks"] }, 100],
                            },
                        },
                    },
                },
            },

            // Populate instructor
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
                },
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },

            // Populate category
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [{ $project: { name: 1, slug: 1 } }],
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        ]);

        if (!result || result.length === 0) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return result[0];
    },

    // -------------------- GET RESUME INFO (CONTINUE LEARNING) --------------------
    // 🚀 ULTRA-OPTIMIZED: Uses aggregation pipeline (single DB hit)
    getResumeInfo: async (userId: string, courseId: string) => {
        const latestAttempt = await contentAttemptRepository.getLatestAttempt(userId, courseId);

        // No progress exists - return null safely
        if (!latestAttempt) {
            return null;
        }

        // Data already flattened from aggregation pipeline
        const { content, lesson, section, course } = latestAttempt as any;

        return {
            // Resume identifiers
            lessonId: latestAttempt.lessonId || null,
            contentId: latestAttempt.contentId || null,
            courseId: latestAttempt.courseId || null,

            // Resume position
            resumeAt: latestAttempt.resumeAt || 0,
            totalDuration: latestAttempt.totalDuration || 0,
            resumePercentage: latestAttempt.totalDuration
                ? Math.round((latestAttempt.resumeAt / latestAttempt.totalDuration) * 100)
                : 0,

            // Content details
            contentTitle: content?.title || null,
            contentType: content?.type || null,
            contentOrder: content?.order || 0,

            // Lesson details
            lessonTitle: lesson?.title || null,
            lessonOrder: lesson?.order || 0,

            // Section details (for navigation context)
            sectionTitle: section?.title || null,
            sectionOrder: section?.order || 0,

            // Course details
            courseTitle: course?.title || null,
            courseSlug: course?.slug || null,

            // Progress status
            isCompleted: latestAttempt.isCompleted,
            obtainedMarks: latestAttempt.obtainedMarks || 0,
            totalMarks: latestAttempt.totalMarks || 0,

            // Timestamps
            lastAccessedAt: latestAttempt.lastAccessedAt,
        };
    },
};

export default {
    courseService,
    sectionService,
    lessonService,
    lessonContentService,
    contentProgressService,
    courseProgressService,
};
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import {
    courseRepository,
} from "src/repositories/course.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
import { lessonRepository } from "src/repositories/lesson.repository.js";
import { sectionRepository } from "src/repositories/section.repository.js";
import AppError from "src/utils/AppError.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";




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

        const newLesson = await lessonRepository.create(lessonData);
        await batchRepository.invalidateCourseStructure(section.courseId.toString());
        await courseProgressRepository.invalidateAll(section.courseId.toString());
        return newLesson;
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

        const updated = await lessonRepository.updateById(lessonId, data);
        await batchRepository.invalidateCourseStructure(lesson.courseId.toString());
        await courseProgressRepository.invalidateAll(lesson.courseId.toString());
        return updated;
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

        await batchRepository.invalidateCourseStructure(lesson.courseId.toString());
        await courseProgressRepository.invalidateAll(lesson.courseId.toString());

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
        await lessonRepository.bulkReorder(lessons);
        const result = await lessonRepository.findBySection(sectionId);
        await batchRepository.invalidateCourseStructure(section.courseId.toString());
        await courseProgressRepository.invalidateAll(section.courseId.toString());
        return result;
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

        const result = await lessonRepository.toggleVisibility(lessonId);
        await batchRepository.invalidateCourseStructure(lesson.courseId.toString());
        await courseProgressRepository.invalidateAll(lesson.courseId.toString());
        return result;
    },
};
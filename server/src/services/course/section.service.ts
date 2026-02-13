import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import {
    courseRepository,
} from "src/repositories/course.repository.js";
import { lessonRepository } from "src/repositories/lesson.repository.js";
import { sectionRepository } from "src/repositories/section.repository.js";
import AppError from "src/utils/AppError.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";



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
        await batchRepository.invalidateCourseStructure(courseId);
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

        const updated = await sectionRepository.updateById(sectionId, data);
        await batchRepository.invalidateCourseStructure(section.courseId.toString());
        return updated;
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
        await batchRepository.invalidateCourseStructure(section.courseId.toString());

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
        const result = await sectionRepository.findByCourse(courseId);
        await batchRepository.invalidateCourseStructure(courseId);
        return result;
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

        const result = await sectionRepository.toggleVisibility(sectionId);
        await batchRepository.invalidateCourseStructure(section.courseId.toString());
        return result;
    },
};
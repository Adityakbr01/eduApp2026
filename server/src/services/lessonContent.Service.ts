import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import {
    contentAttemptRepository,
    courseRepository,
    lessonContentRepository,
    lessonRepository
} from "src/repositories/course.repository.js";
import AppError from "src/utils/AppError.js";
import extractS3Path from "src/utils/extractS3Path.js";






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



    // 🔥 filter & cut raw URL
   if (data.type === "video" && data.video?.rawKey) {
    data.video.rawKey = extractS3Path(data.video.rawKey);
}

        console.log(data)

    

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
    const content = await lessonContentRepository.findById(contentId);
    if (!content) {
        throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const isOwner = await courseRepository.isOwner(
        content.courseId.toString(),
        instructorId
    );
    if (!isOwner) {
        throw new AppError(
            "You don't have permission to update this content",
            STATUSCODE.FORBIDDEN,
            ERROR_CODE.FORBIDDEN
        );
    }

    let updateData = { ...data };

    // 🔥 normalize video raw url
    if (data.type === "video" && data.rowUrl) {
        updateData.rowUrl = extractS3Path(data.rowUrl);
    }

    return lessonContentRepository.updateById(contentId, updateData);
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

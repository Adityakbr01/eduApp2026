import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { contentAttemptRepository } from "src/repositories/contentAttempt.repository.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";
import {
  courseRepository,
} from "src/repositories/course.repository.js";
import { lessonRepository } from "src/repositories/lesson.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
import AppError from "src/utils/AppError.js";
import normalizeVideoPayload from "src/utils/normalizeVideoPayload.js";






// ============================================
// LESSON CONTENT SERVICE
// ============================================
export const lessonContentService = {
  // -------------------- CREATE CONTENT --------------------
  createContent: async (lessonId: string, instructorId: string, data) => {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new AppError("Lesson not found", 404, ERROR_CODE.NOT_FOUND);
    }

    const isOwner = await courseRepository.isOwner(
      lesson.courseId.toString(),
      instructorId
    );
    if (!isOwner) {
      throw new AppError("Forbidden", 403, ERROR_CODE.FORBIDDEN);
    }

    const maxOrder = await lessonContentRepository.getMaxOrder(lessonId);

    // 🔥 VIDEO STATUS INIT
    if (data.type === "video" && data.video?.rawKey) {
      data.video = normalizeVideoPayload(data.video);
    }

    const contentData = {
      ...data,
      lessonId,
      courseId: lesson.courseId,
      order: maxOrder + 1,
    };

    const newContent = await lessonContentRepository.create(contentData);
    await batchRepository.invalidateCourseStructure(lesson.courseId.toString());
    await courseProgressRepository.invalidateAll(lesson.courseId.toString());
    return newContent;
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
  updateContent: async (contentId, instructorId, data) => {
    const content = await lessonContentRepository.findById(contentId);
    if (!content) {
      throw new AppError("Content not found", 404, ERROR_CODE.NOT_FOUND);
    }

    const isOwner = await courseRepository.isOwner(
      content.courseId.toString(),
      instructorId
    );
    if (!isOwner) {
      throw new AppError("Forbidden", 403, ERROR_CODE.FORBIDDEN);
    }

    const updateData = { ...data };

    // 🔥 VIDEO RE-UPLOAD HANDLING
    if (content.type === "video" && data.video?.rawKey && !data.video?.hlsKey && data.video?.status !== "uploaded") {
      updateData.video = normalizeVideoPayload(data.video);
    }

    const updated = await lessonContentRepository.updateById(contentId, updateData);
    await batchRepository.invalidateCourseStructure(content.courseId.toString());
    await courseProgressRepository.invalidateAll(content.courseId.toString());
    return updated;
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

    await batchRepository.invalidateCourseStructure(content.courseId.toString());
    await courseProgressRepository.invalidateAll(content.courseId.toString());

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
    const result = await lessonContentRepository.findByLesson(lessonId);
    await batchRepository.invalidateCourseStructure(lesson.courseId.toString());
    await courseProgressRepository.invalidateAll(lesson.courseId.toString());
    return result;
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

    const result = await lessonContentRepository.toggleVisibility(contentId);
    await batchRepository.invalidateCourseStructure(content.courseId.toString());
    await courseProgressRepository.invalidateAll(content.courseId.toString());
    return result;
  },
};

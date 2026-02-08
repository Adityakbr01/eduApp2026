import type { Types, UpdateQuery } from "mongoose";
import mongoose from "mongoose";
import { LessonContent } from "src/models/course/index.js";



// ============================================
// LESSON CONTENT REPOSITORY

// ============================================
export const lessonContentRepository = {
    // Create
    create: async (data: any) => {
        return LessonContent.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return LessonContent.findOne({ _id: id, isDeleted: { $ne: true } });
    },

    // Find all contents by lesson
    findByLesson: async (lessonId: string | Types.ObjectId) => {
        return LessonContent.find({ lessonId, isDeleted: { $ne: true } })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in lesson
    getMaxOrder: async (lessonId: string | Types.ObjectId) => {
        const lastContent = await LessonContent.findOne({ lessonId, isDeleted: { $ne: true } })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastContent?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return LessonContent.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID (Soft Delete)
    deleteById: async (id: string | Types.ObjectId) => {
        return LessonContent.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    },

    // Bulk reorder contents
    bulkReorder: async (contents: { id: string; order: number }[]) => {
        const bulkOps = contents.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id), isDeleted: { $ne: true } },
                update: { $set: { order } },
            },
        }));
        return LessonContent.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const content = await LessonContent.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!content) return null;
        content.isVisible = !content.isVisible;
        return content.save();
    },

    // Delete all contents by lesson
    // Delete all contents by lesson (Soft Delete)
    deleteByLesson: async (lessonId: string | Types.ObjectId) => {
        return LessonContent.updateMany({ lessonId }, { isDeleted: true, deletedAt: new Date() });
    },

    // Delete all contents by course (Soft Delete)
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return LessonContent.updateMany({ courseId }, { isDeleted: true, deletedAt: new Date() });
    },
};
import mongoose, { Types, type UpdateQuery } from "mongoose";
import { Lesson } from "src/models/course/index.js";


// ============================================
// LESSON REPOSITORY
// ============================================
export const lessonRepository = {
    // Create
    create: async (data: any) => {
        return Lesson.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return Lesson.findOne({ _id: id, isDeleted: { $ne: true } });
    },

    // Find all lessons by section
    findBySection: async (sectionId: string | Types.ObjectId) => {
        return Lesson.find({ sectionId, isDeleted: { $ne: true } })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in section
    getMaxOrder: async (sectionId: string | Types.ObjectId) => {
        const lastLesson = await Lesson.findOne({ sectionId, isDeleted: { $ne: true } })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastLesson?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID (Soft Delete)
    deleteById: async (id: string | Types.ObjectId) => {
        return Lesson.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    },

    // Bulk reorder lessons
    bulkReorder: async (lessons: { id: string; order: number }[]) => {
        const bulkOps = lessons.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id), isDeleted: { $ne: true } },
                update: { $set: { order } },
            },
        }));
        return Lesson.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const lesson = await Lesson.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!lesson) return null;
        lesson.isVisible = !lesson.isVisible;
        return lesson.save();
    },

    // Delete all lessons by section
    // Delete all lessons by section (Soft Delete)
    deleteBySection: async (sectionId: string | Types.ObjectId) => {
        return Lesson.updateMany({ sectionId }, { isDeleted: true, deletedAt: new Date() });
    },

    // Delete all lessons by course (Soft Delete)
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return Lesson.updateMany({ courseId }, { isDeleted: true, deletedAt: new Date() });
    },
};
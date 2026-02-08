// ============================================
// SECTION REPOSITORY

import { Section } from "src/models/course/index.js";
import mongoose, { Types, type UpdateQuery } from "mongoose";

// ============================================
export const sectionRepository = {
    // Create
    create: async (data: any) => {
        return Section.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return Section.findOne({ _id: id, isDeleted: { $ne: true } });
    },

    // Find all sections by course
    findByCourse: async (courseId: string | Types.ObjectId) => {
        return Section.find({ courseId, isDeleted: { $ne: true } })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in course
    getMaxOrder: async (courseId: string | Types.ObjectId) => {
        const lastSection = await Section.findOne({ courseId, isDeleted: { $ne: true } })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastSection?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID (Soft Delete)
    deleteById: async (id: string | Types.ObjectId) => {
        return Section.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    },

    // Bulk reorder sections
    bulkReorder: async (sections: { id: string; order: number }[]) => {
        const bulkOps = sections.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id), isDeleted: { $ne: true } },
                update: { $set: { order } },
            },
        }));
        return Section.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const section = await Section.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!section) return null;
        section.isVisible = !section.isVisible;
        return section.save();
    },

    // Delete all sections by course (Soft Delete)
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return Section.updateMany({ courseId }, { isDeleted: true, deletedAt: new Date() });
    },
};

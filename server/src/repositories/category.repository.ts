import { Types } from "mongoose";
import { CategoryModel } from "src/models/category.model.js";
import type { CategoryFilterDTO, CreateCategoryDTO, UpdateCategoryDTO } from "src/types/category.type.js";

export const categoryRepository = {
    // ==================== CREATE ====================
    create: async (data: CreateCategoryDTO) => {
        return CategoryModel.create(data);
    },

    // ==================== FIND BY ID ====================
    findById: async (categoryId: string) => {
        return CategoryModel.findById(categoryId);
    },

    findByIdPopulated: async (categoryId: string) => {
        return CategoryModel.findById(categoryId).populate("parent", "name slug icon");
    },

    findByIdLean: async (categoryId: string) => {
        return CategoryModel.findById(categoryId).lean();
    },

    // ==================== FIND BY SLUG ====================
    findBySlug: async (slug: string) => {
        return CategoryModel.findOne({ slug, isActive: true });
    },

    // ==================== FIND ALL ====================
    findAll: async (filter: CategoryFilterDTO = {}) => {
        const query: Record<string, unknown> = { isActive: true };

        if (filter.parent !== undefined) {
            query.parent = filter.parent ? new Types.ObjectId(filter.parent) : null;
        }

        if (filter.level !== undefined) {
            query.level = filter.level;
        }

        if (filter.isFeatured !== undefined) {
            query.isFeatured = filter.isFeatured;
        }

        if (filter.search) {
            query.$text = { $search: filter.search };
        }

        return CategoryModel.find(query)
            .sort({ order: 1, name: 1 })
            .lean();
    },

    // ==================== FIND ROOT CATEGORIES ====================
    findRootCategories: async () => {
        return CategoryModel.find({ parent: null, isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();
    },

    // ==================== FIND SUBCATEGORIES ====================
    findSubcategories: async (parentId: string) => {
        return CategoryModel.find({ parent: new Types.ObjectId(parentId), isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();
    },

    // ==================== FIND WITH SUBCATEGORIES ====================
    findWithSubcategories: async (parentId: string) => {
        return CategoryModel.find({
            $or: [
                { _id: new Types.ObjectId(parentId) },
                { parent: new Types.ObjectId(parentId) }
            ],
            isActive: true,
        })
            .sort({ level: 1, order: 1 })
            .lean();
    },

    // ==================== FIND FEATURED ====================
    findFeatured: async (limit: number = 10) => {
        return CategoryModel.find({ isFeatured: true, isActive: true })
            .sort({ coursesCount: -1 })
            .limit(limit)
            .lean();
    },

    // ==================== FIND ALL WITH HIERARCHY ====================
    findAllWithHierarchy: async () => {
        // Get all active categories sorted by level and order
        return CategoryModel.find({ isActive: true })
            .sort({ level: 1, order: 1, name: 1 })
            .lean();
    },

    // ==================== UPDATE ====================
    update: async (categoryId: string, data: UpdateCategoryDTO) => {
        return CategoryModel.findByIdAndUpdate(categoryId, data, {
            new: true,
            runValidators: true,
        });
    },

    // ==================== DELETE ====================
    delete: async (categoryId: string) => {
        return CategoryModel.findByIdAndDelete(categoryId);
    },

    // ==================== SOFT DELETE (SET INACTIVE) ====================
    softDelete: async (categoryId: string) => {
        return CategoryModel.findByIdAndUpdate(
            categoryId,
            { isActive: false },
            { new: true }
        );
    },

    // ==================== INCREMENT COURSE COUNT ====================
    incrementCourseCount: async (categoryId: string) => {
        return CategoryModel.findByIdAndUpdate(
            categoryId,
            { $inc: { coursesCount: 1 } },
            { new: true }
        );
    },

    // ==================== DECREMENT COURSE COUNT ====================
    decrementCourseCount: async (categoryId: string) => {
        return CategoryModel.findByIdAndUpdate(
            categoryId,
            { $inc: { coursesCount: -1 } },
            { new: true }
        );
    },

    // ==================== CHECK IF CATEGORY EXISTS ====================
    exists: async (categoryId: string) => {
        return CategoryModel.exists({ _id: new Types.ObjectId(categoryId), isActive: true });
    },

    // ==================== VALIDATE PARENT-CHILD RELATIONSHIP ====================
    validateSubcategory: async (parentId: string, subcategoryId: string) => {
        const subcategory = await CategoryModel.findOne({
            _id: new Types.ObjectId(subcategoryId),
            parent: new Types.ObjectId(parentId),
            isActive: true,
        });
        return !!subcategory;
    },

    // ==================== COUNT ====================
    count: async (filter: CategoryFilterDTO = {}) => {
        const query: Record<string, unknown> = { isActive: true };

        if (filter.parent !== undefined) {
            query.parent = filter.parent ? new Types.ObjectId(filter.parent) : null;
        }

        if (filter.level !== undefined) {
            query.level = filter.level;
        }

        return CategoryModel.countDocuments(query);
    },
};

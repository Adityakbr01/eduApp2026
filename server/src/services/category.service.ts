import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { categoryRepository } from "src/repositories/category.repository.js";
import type {
    CategoryFilterDTO,
    CreateCategoryDTO,
    UpdateCategoryDTO,
    CategoryTreeNode,
    CategoryWithSubcategories,
    ICategory,
} from "src/types/category.type.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";

const categoryService = {
    // ==================== GET ALL CATEGORIES ====================
    getAllCategories: async (filter: CategoryFilterDTO = {}) => {
        const categories = await categoryRepository.findAll(filter);
        return categories;
    },

    // ==================== GET ROOT CATEGORIES ====================
    getRootCategories: async () => {
        const categories = await categoryRepository.findRootCategories();
        return categories;
    },

    // ==================== GET SUBCATEGORIES ====================
    getSubcategories: async (parentId: string) => {
        // Validate parentId
        if (!Types.ObjectId.isValid(parentId)) {
            throw new AppError(
                "Invalid parent category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "parentId", message: "Parent category ID must be a valid ID" }]
            );
        }

        // Check if parent category exists
        const parentExists = await categoryRepository.exists(parentId);
        if (!parentExists) {
            throw new AppError(
                "Parent category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "parentId", message: "Parent category does not exist" }]
            );
        }

        const subcategories = await categoryRepository.findSubcategories(parentId);
        return subcategories;
    },

    // ==================== GET CATEGORY BY ID ====================
    getCategoryById: async (categoryId: string) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "categoryId", message: "Category ID must be a valid ID" }]
            );
        }

        const category = await categoryRepository.findByIdPopulated(categoryId);
        if (!category) {
            throw new AppError(
                "Category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        return category;
    },

    // ==================== GET CATEGORY BY SLUG ====================
    getCategoryBySlug: async (slug: string) => {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new AppError(
                "Category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        return category;
    },

    // ==================== GET FEATURED CATEGORIES ====================
    getFeaturedCategories: async (limit: number = 10) => {
        const categories = await categoryRepository.findFeatured(limit);
        return categories;
    },

    // ==================== GET CATEGORIES WITH SUBCATEGORIES (TREE) ====================
    getCategoriesTree: async () => {
        const allCategories = await categoryRepository.findAllWithHierarchy();

        // Build tree structure
        const tree: CategoryTreeNode[] = [];
        const categoryMap = new Map<string, CategoryTreeNode>();

        // First pass: create nodes
        for (const category of allCategories) {
            const node: CategoryTreeNode = {
                _id: category._id.toString(),
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                level: category.level,
                order: category.order,
                coursesCount: category.coursesCount,
                children: [],
            };
            categoryMap.set(category._id.toString(), node);
        }

        // Second pass: build tree
        for (const category of allCategories) {
            const node = categoryMap.get(category._id.toString());
            if (!node) continue;

            if (category.parent) {
                const parentNode = categoryMap.get(category.parent.toString());
                if (parentNode) {
                    parentNode.children.push(node);
                }
            } else {
                tree.push(node);
            }
        }

        return tree;
    },

    // ==================== GET CATEGORIES WITH SUBCATEGORIES (FLAT) ====================
    getCategoriesWithSubcategories: async () => {
        const allCategories = await categoryRepository.findAllWithHierarchy();

        // Group by parent
        const rootCategories = allCategories.filter((cat) => !cat.parent);
        const result = rootCategories.map((root) => ({
            ...root,
            subcategories: allCategories.filter(
                (cat) => cat.parent?.toString() === root._id.toString()
            ),
        }));

        return result;
    },

    // ==================== VALIDATE SUBCATEGORY ====================
    validateSubcategory: async (categoryId: string, subcategoryId: string) => {
        // Validate IDs
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "categoryId", message: "Category ID must be a valid ID" }]
            );
        }

        if (!Types.ObjectId.isValid(subcategoryId)) {
            throw new AppError(
                "Invalid subcategory ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "subcategoryId", message: "Subcategory ID must be a valid ID" }]
            );
        }

        // Check if category exists
        const categoryExists = await categoryRepository.exists(categoryId);
        if (!categoryExists) {
            throw new AppError(
                "Category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
                [{ path: "categoryId", message: "Category does not exist" }]
            );
        }

        // Validate parent-child relationship
        const isValid = await categoryRepository.validateSubcategory(categoryId, subcategoryId);
        if (!isValid) {
            throw new AppError(
                "Invalid subcategory",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "subcategoryId", message: "Subcategory does not belong to the selected category" }]
            );
        }

        return true;
    },

    // ==================== CREATE CATEGORY (ADMIN) ====================
    createCategory: async (data: CreateCategoryDTO) => {
        // Set level based on parent
        let level = 0;
        if (data.parent) {
            if (!Types.ObjectId.isValid(data.parent)) {
                throw new AppError(
                    "Invalid parent category ID",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.VALIDATION_ERROR,
                    [{ path: "parent", message: "Parent category ID must be a valid ID" }]
                );
            }

            const parentCategory = await categoryRepository.findById(data.parent);
            if (!parentCategory) {
                throw new AppError(
                    "Parent category not found",
                    STATUSCODE.NOT_FOUND,
                    ERROR_CODE.NOT_FOUND,
                    [{ path: "parent", message: "Parent category does not exist" }]
                );
            }

            level = parentCategory.level + 1;
            if (level > 2) {
                throw new AppError(
                    "Maximum category depth exceeded",
                    STATUSCODE.BAD_REQUEST,
                    ERROR_CODE.VALIDATION_ERROR,
                    [{ path: "parent", message: "Categories can only be nested up to 2 levels" }]
                );
            }
        }

        const category = await categoryRepository.create({
            ...data,
            parent: data.parent as string,
        });

        // Update level after creation
        category.level = level;
        await category.save();

        logger.info(`Category created: ${category.name} (${category._id})`);
        return category;
    },

    // ==================== UPDATE CATEGORY (ADMIN) ====================
    updateCategory: async (categoryId: string, data: UpdateCategoryDTO) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "categoryId", message: "Category ID must be a valid ID" }]
            );
        }

        const category = await categoryRepository.update(categoryId, data);
        if (!category) {
            throw new AppError(
                "Category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        logger.info(`Category updated: ${category.name} (${category._id})`);
        return category;
    },

    // ==================== DELETE CATEGORY (ADMIN) ====================
    deleteCategory: async (categoryId: string, soft: boolean = true) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new AppError(
                "Invalid category ID",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "categoryId", message: "Category ID must be a valid ID" }]
            );
        }

        // Check if category has courses
        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            throw new AppError(
                "Category not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND
            );
        }

        if (category.coursesCount > 0 && !soft) {
            throw new AppError(
                "Cannot delete category with courses",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.VALIDATION_ERROR,
                [{ path: "categoryId", message: "Category has courses and cannot be permanently deleted" }]
            );
        }

        if (soft) {
            await categoryRepository.softDelete(categoryId);
            logger.info(`Category soft deleted: ${category.name} (${category._id})`);
        } else {
            await categoryRepository.delete(categoryId);
            logger.info(`Category deleted: ${category.name} (${category._id})`);
        }

        return { message: "Category deleted successfully" };
    },
};

export default categoryService;

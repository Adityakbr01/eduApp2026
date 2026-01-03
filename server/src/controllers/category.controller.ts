import type { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import categoryService from "src/services/category.service.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import type { CategoryFilterDTO } from "src/types/category.type.js";


const categoryController = {
    // ==================== PUBLIC ROUTES ====================

    /**
     * @route   GET /api/v1/categories
     * @desc    Get all categories (with optional filters)
     * @access  Public
     */
    getAllCategories: asyncHandler(
        async (req, res: Response, _next: NextFunction) => {
            const filter: CategoryFilterDTO = {
                parent: req.query.parent as string | undefined,
                level: req.query.level ? Number(req.query.level) : undefined,
                isFeatured: req.query.isFeatured === "true" ? true : undefined,
                search: req.query.search as string | undefined,
            };

            const categories = await categoryService.getAllCategories(filter);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Categories fetched successfully",
                data: {
                    categories,
                    total: categories.length,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/root
     * @desc    Get root categories (level 0)
     * @access  Public
     */
    getRootCategories: asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const categories = await categoryService.getRootCategories();

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Root categories fetched successfully",
                data: {
                    categories,
                    total: categories.length,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/tree
     * @desc    Get categories in tree structure (with nested children)
     * @access  Public
     */
    getCategoriesTree: asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const tree = await categoryService.getCategoriesTree();

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Categories tree fetched successfully",
                data: {
                    categories: tree,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/with-subcategories
     * @desc    Get categories with subcategories (flat structure with subcategories array)
     * @access  Public
     */
    getCategoriesWithSubcategories: asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const categories = await categoryService.getCategoriesWithSubcategories();

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Categories with subcategories fetched successfully",
                data: {
                    categories,
                    total: categories.length,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/featured
     * @desc    Get featured categories
     * @access  Public
     */
    getFeaturedCategories: asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const categories = await categoryService.getFeaturedCategories(limit);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Featured categories fetched successfully",
                data: {
                    categories,
                    total: categories.length,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/:id/subcategories
     * @desc    Get subcategories of a category
     * @access  Public
     */
    getSubcategories: asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const { id } = req.params;
            const subcategories = await categoryService.getSubcategories(id);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Subcategories fetched successfully",
                data: {
                    subcategories,
                    total: subcategories.length,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/:id
     * @desc    Get category by ID
     * @access  Public
     */
    getCategoryById: asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const { id } = req.params;
            const category = await categoryService.getCategoryById(id);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Category fetched successfully",
                data: {
                    category,
                },
            });
        }
    ),

    /**
     * @route   GET /api/v1/categories/slug/:slug
     * @desc    Get category by slug
     * @access  Public
     */
    getCategoryBySlug: asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const { slug } = req.params;
            const category = await categoryService.getCategoryBySlug(slug);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Category fetched successfully",
                data: {
                    category,
                },
            });
        }
    ),

    /**
     * @route   POST /api/v1/categories/validate-subcategory
     * @desc    Validate if subcategory belongs to category
     * @access  Public
     */
    validateSubcategory: asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const { categoryId, subcategoryId } = req.body;
            const isValid = await categoryService.validateSubcategory(categoryId, subcategoryId);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Subcategory is valid",
                data: {
                    isValid,
                },
            });
        }
    ),

    // ==================== ADMIN ROUTES ====================

    /**
     * @route   POST /api/v1/categories
     * @desc    Create a new category
     * @access  Private - Admin
     */
    createCategory: asyncHandler(
        async (req, res: Response, _next: NextFunction) => {
            const category = await categoryService.createCategory(req.body);

            res.status(STATUSCODE.CREATED).json({
                success: true,
                message: "Category created successfully",
                data: {
                    category,
                },
            });
        }
    ),

    /**
     * @route   PUT /api/v1/categories/:id
     * @desc    Update a category
     * @access  Private - Admin
     */
    updateCategory: asyncHandler(
        async (req, res: Response, _next: NextFunction) => {
            const { id } = req.params;
            const category = await categoryService.updateCategory(id, req.body);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: "Category updated successfully",
                data: {
                    category,
                },
            });
        }
    ),

    /**
     * @route   DELETE /api/v1/categories/:id
     * @desc    Delete a category (soft delete by default)
     * @access  Private - Admin
     */
    deleteCategory: asyncHandler(
        async (req, res: Response, _next: NextFunction) => {
            const { id } = req.params;
            const soft = req.query.soft !== "false";
            const result = await categoryService.deleteCategory(id, soft);

            res.status(STATUSCODE.OK).json({
                success: true,
                message: result.message,
            });
        }
    ),
};

export default categoryController;

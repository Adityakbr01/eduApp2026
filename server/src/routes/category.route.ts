import { Router } from "express";
import { ROLES } from "src/constants/roles.js";
import categoryController from "src/controllers/category.controller.js";
import authMiddleware from "src/middlewares/system/authMiddleware.js";
import checkRole from "src/middlewares/system/checkRole.js";

const router = Router();

// ==================================================================================
// PUBLIC ROUTES (No authentication required)
// ==================================================================================

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories with optional filters
 * @access  Public
 * @query   parent, level, isFeatured, search
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/root
 * @desc    Get root categories (level 0 - main categories)
 * @access  Public
 */
router.get("/root", categoryController.getRootCategories);

/**
 * @route   GET /api/v1/categories/tree
 * @desc    Get categories in tree structure with nested children
 * @access  Public
 */
router.get("/tree", categoryController.getCategoriesTree);

/**
 * @route   GET /api/v1/categories/with-subcategories
 * @desc    Get categories with subcategories as flat array
 * @access  Public
 */
router.get("/with-subcategories", categoryController.getCategoriesWithSubcategories);

/**
 * @route   GET /api/v1/categories/featured
 * @desc    Get featured categories
 * @access  Public
 * @query   limit (default: 10)
 */
router.get("/featured", categoryController.getFeaturedCategories);

/**
 * @route   POST /api/v1/categories/validate-subcategory
 * @desc    Validate if subcategory belongs to a category
 * @access  Public
 * @body    { categoryId, subcategoryId }
 */
router.post("/validate-subcategory", categoryController.validateSubcategory);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get("/slug/:slug", categoryController.getCategoryBySlug);

/**
 * @route   GET /api/v1/categories/:id/subcategories
 * @desc    Get subcategories of a category
 * @access  Public
 */
router.get("/:id/subcategories", categoryController.getSubcategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 * @note    This route MUST be after all specific routes to avoid conflicts
 */
router.get("/:id", categoryController.getCategoryById);

// ==================================================================================
// PROTECTED ROUTES (Authentication required - Admin only)
// ==================================================================================
router.use(authMiddleware);

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private - Admin only
 */
router.post(
    "/",
    checkRole(ROLES.ADMIN.code),
    categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update a category
 * @access  Private - Admin only
 */
router.put(
    "/:id",
    checkRole(ROLES.ADMIN.code),
    categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a category (soft delete by default)
 * @access  Private - Admin only
 * @query   soft (default: true) - Set to false for hard delete
 */
router.delete(
    "/:id",
    checkRole(ROLES.ADMIN.code),
    categoryController.deleteCategory
);

export default router;

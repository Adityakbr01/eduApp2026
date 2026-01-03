import apiClient from "@/lib/api/axios";
import {
    ApiResponse,
    CategoryListData,
    CategoryTreeData,
    CategoryWithSubcategoriesData,
    SubcategoryListData,
    CategoryDetailData,
    ValidateSubcategoryData,
    CategoryFilterDTO,
} from "./types";

// ==================== QUERY PARAMS BUILDER ====================

const buildQueryParams = (filters?: CategoryFilterDTO): string => {
    if (!filters) return "";

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
};

// ==================== CATEGORY API ====================

export const categoryApi = {
    // Get all categories (with optional filters)
    getAllCategories: async (
        filters?: CategoryFilterDTO
    ): Promise<ApiResponse<CategoryListData>> => {
        const queryParams = buildQueryParams(filters);
        const { data } = await apiClient.get(`/categories${queryParams}`);
        return data;
    },

    // Get root categories (level 0)
    getRootCategories: async (): Promise<ApiResponse<CategoryListData>> => {
        const { data } = await apiClient.get("/categories/root");
        return data;
    },

    // Get categories tree (nested structure)
    getCategoriesTree: async (): Promise<ApiResponse<CategoryTreeData>> => {
        const { data } = await apiClient.get("/categories/tree");
        return data;
    },

    // Get categories with subcategories (flat with subcategories array)
    getCategoriesWithSubcategories: async (): Promise<
        ApiResponse<CategoryWithSubcategoriesData>
    > => {
        const { data } = await apiClient.get("/categories/with-subcategories");
        return data;
    },

    // Get featured categories
    getFeaturedCategories: async (
        limit: number = 10
    ): Promise<ApiResponse<CategoryListData>> => {
        const { data } = await apiClient.get(`/categories/featured?limit=${limit}`);
        return data;
    },

    // Get subcategories of a category
    getSubcategories: async (
        parentId: string
    ): Promise<ApiResponse<SubcategoryListData>> => {
        const { data } = await apiClient.get(`/categories/${parentId}/subcategories`);
        return data;
    },

    // Get category by ID
    getCategoryById: async (id: string): Promise<ApiResponse<CategoryDetailData>> => {
        const { data } = await apiClient.get(`/categories/${id}`);
        return data;
    },

    // Get category by slug
    getCategoryBySlug: async (
        slug: string
    ): Promise<ApiResponse<CategoryDetailData>> => {
        const { data } = await apiClient.get(`/categories/slug/${slug}`);
        return data;
    },

    // Validate subcategory belongs to category
    validateSubcategory: async (
        categoryId: string,
        subcategoryId: string
    ): Promise<ApiResponse<ValidateSubcategoryData>> => {
        const { data } = await apiClient.post("/categories/validate-subcategory", {
            categoryId,
            subcategoryId,
        });
        return data;
    },
};

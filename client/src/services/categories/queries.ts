import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { categoryApi } from "./api";
import {
    CategoryListData,
    CategoryTreeData,
    CategoryWithSubcategoriesData,
    SubcategoryListData,
    CategoryDetailData,
    CategoryFilterDTO,
} from "./types";
import { ApiResponse } from "../auth";

// ==================== CATEGORY QUERIES ====================

export const useGetAllCategories = (
    filters?: CategoryFilterDTO,
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryListData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.ALL, filters],
        queryFn: () => categoryApi.getAllCategories(filters),
        ...options,
    });
};

export const useGetRootCategories = (
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryListData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.ROOT],
        queryFn: () => categoryApi.getRootCategories(),
        ...options,
    });
};

export const useGetCategoriesTree = (
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryTreeData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.TREE],
        queryFn: () => categoryApi.getCategoriesTree(),
        ...options,
    });
};

export const useGetCategoriesWithSubcategories = (
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryWithSubcategoriesData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.WITH_SUBCATEGORIES],
        queryFn: () => categoryApi.getCategoriesWithSubcategories(),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        ...options,
    });
};

export const useGetFeaturedCategories = (
    limit: number = 10,
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryListData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.FEATURED, limit],
        queryFn: () => categoryApi.getFeaturedCategories(limit),
        ...options,
    });
};

export const useGetSubcategories = (
    parentId: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<SubcategoryListData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.SUBCATEGORIES, parentId],
        queryFn: () => categoryApi.getSubcategories(parentId),
        enabled: !!parentId,
        ...options,
    });
};

export const useGetCategoryById = (
    id: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryDetailData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.BY_ID, id],
        queryFn: () => categoryApi.getCategoryById(id),
        enabled: !!id,
        ...options,
    });
};

export const useGetCategoryBySlug = (
    slug: string,
    options?: Omit<
        UseQueryOptions<ApiResponse<CategoryDetailData>>,
        "queryKey" | "queryFn"
    >
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES.BY_SLUG, slug],
        queryFn: () => categoryApi.getCategoryBySlug(slug),
        enabled: !!slug,
        ...options,
    });
};

// ==================== INTERFACES ====================

export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    parent?: string | ICategory;
    level: number;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    coursesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ICategoryTreeNode {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    level: number;
    order: number;
    coursesCount: number;
    children: ICategoryTreeNode[];
}

export interface ICategoryWithSubcategories extends ICategory {
    subcategories: ICategory[];
}

// ==================== API RESPONSE INTERFACES ====================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface CategoryListData {
    categories: ICategory[];
    total: number;
}

export interface CategoryTreeData {
    categories: ICategoryTreeNode[];
}

export interface CategoryWithSubcategoriesData {
    categories: ICategoryWithSubcategories[];
    total: number;
}

export interface SubcategoryListData {
    subcategories: ICategory[];
    total: number;
}

export interface CategoryDetailData {
    category: ICategory;
}

export interface ValidateSubcategoryData {
    isValid: boolean;
}

// ==================== FILTER INTERFACES ====================

export interface CategoryFilterDTO {
    parent?: string;
    level?: number;
    isFeatured?: boolean;
    search?: string;
}

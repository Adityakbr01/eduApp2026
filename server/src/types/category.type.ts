import { Types } from "mongoose";

// ==================== INTERFACES ====================

export interface ICategory {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    parent?: Types.ObjectId | ICategory;
    level: number;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    coursesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryMetadata {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
}

export interface IPopulatedCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    level: number;
    order: number;
    coursesCount: number;
}

// ==================== DTO INTERFACES ====================

export interface CreateCategoryDTO {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    parent?: string;
    order?: number;
    isFeatured?: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
    isActive?: boolean;
}

export interface CategoryFilterDTO {
    parent?: string | null;
    level?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
}

// ==================== API RESPONSE INTERFACES ====================

export interface CategoryListResponse {
    categories: ICategory[];
    total: number;
}

export interface CategoryWithSubcategories extends ICategory {
    subcategories: ICategory[];
}

export interface CategoryTreeNode {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    level: number;
    order: number;
    coursesCount: number;
    children: CategoryTreeNode[];
}

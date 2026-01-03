import { Schema, model, Document, Types } from "mongoose";

// ==================== INTERFACE ====================
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image?: string;
    parent?: Types.ObjectId | ICategory;
    level: number; // 0 = root, 1 = subcategory, 2 = sub-subcategory
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    coursesCount: number;
    metadata?: {
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}

// ==================== SCHEMA ====================
const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            minlength: [2, "Category name must be at least 2 characters"],
            maxlength: [100, "Category name cannot exceed 100 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        icon: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        level: {
            type: Number,
            default: 0,
            min: 0,
            max: 3,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        coursesCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        metadata: {
            seoTitle: { type: String, maxlength: 70 },
            seoDescription: { type: String, maxlength: 160 },
            seoKeywords: { type: [String], default: [] },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ==================== INDEXES ====================
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ level: 1, order: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isFeatured: 1, isActive: 1 });
CategorySchema.index({ name: "text", description: "text" });

// ==================== PRE-SAVE HOOK ====================
CategorySchema.pre("save", function (next) {
    // Generate slug from name if not provided
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    // Set level based on parent
    if (this.isModified("parent")) {
        // Level will be set by the service based on parent's level
        if (!this.parent) {
            this.level = 0;
        }
    }

    next();
});

// ==================== VIRTUALS ====================
CategorySchema.virtual("subcategories", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent",
});

CategorySchema.virtual("isRoot").get(function () {
    return this.level === 0;
});

// ==================== STATIC METHODS ====================
CategorySchema.statics.findActive = function () {
    return this.find({ isActive: true }).sort({ order: 1 });
};

CategorySchema.statics.findRootCategories = function () {
    return this.find({ parent: null, isActive: true }).sort({ order: 1 });
};

CategorySchema.statics.findBySlug = function (slug: string) {
    return this.findOne({ slug, isActive: true });
};

CategorySchema.statics.findFeatured = function (limit = 10) {
    return this.find({ isFeatured: true, isActive: true })
        .sort({ coursesCount: -1 })
        .limit(limit);
};

CategorySchema.statics.findWithSubcategories = function (parentId: Types.ObjectId | string) {
    return this.find({
        $or: [{ _id: parentId }, { parent: parentId }],
        isActive: true,
    }).sort({ level: 1, order: 1 });
};

// ==================== EXPORT ====================
export const CategoryModel = model<ICategory>("Category", CategorySchema);

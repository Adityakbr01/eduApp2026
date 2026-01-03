import { Schema } from "mongoose";
import { CourseLevel, CourseStatus, Currency, DeliveryMode } from "../../types/course.type.js";



import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    // Categorization
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (v: string[]) => v.length <= 10,
            message: "Cannot have more than 10 tags",
        },
    },

    // Course Details
    level: {
        type: String,
        enum: Object.values(CourseLevel),
        default: CourseLevel.BEGINNER,
    },
    language: {
        type: String,
        default: "English",
        trim: true,
    },
    deliveryMode: {
        type: String,
        enum: Object.values(DeliveryMode),
        default: DeliveryMode.RECORDED,
    },


    // Status & Visibility
    status: {
        type: String,
        enum: Object.values(CourseStatus),
        default: CourseStatus.DRAFT,
    },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },

    // Enrollment
    totalEnrollments: { type: Number, default: 0, min: 0 },
    maxEnrollments: { type: Number, min: 1 },

    // Instructors
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Instructor is required"],
    },

    // Basic Information
    title: {
        type: String,
        required: [true, "Course title is required"],
        trim: true,
        minlength: [5, "Title must be at least 5 characters"],
        maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },
    description: {
        type: String,
        required: [true, "Course description is required"],
    },
    shortDescription: {
        type: String,
        required: [true, "Short description is required"],
        maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    coverImage: { type: String },
    previewVideoUrl: { type: String },
    thumbnailUrl: { type: String },


    location: { type: String },
    accessDuration: {
        type: Number,
        default: 365, // in days, 0 = lifetime
        min: 0,
    },

    // Pricing
    pricing: {
        price: { type: Number, required: true, min: 0 },
        currency: {
            type: String,
            enum: Object.values(Currency),
            default: Currency.USD,
        },
        isFree: { type: Boolean, default: false },
    },

    // Content
    curriculum: { type: String, default: "" }, // Markdown text for curriculum/syllabus
    // Ratings

    coInstructors: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],


    // SEO
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
    seoKeywords: { type: [String], default: [] },

    // Timestamps
    lastUpdated: { type: Date, default: Date.now },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    });

export default mongoose.model("Course", courseSchema);

import type { Types, Document } from "mongoose";

// ==================== ENUMS ====================
export enum CourseLevel {
    BEGINNER = "Beginner",
    INTERMEDIATE = "Intermediate",
    ADVANCED = "Advanced",
}

export enum DeliveryMode {
    LIVE = "Live",
    OFFLINE = "Offline",
    RECORDED = "Recorded",
    HYBRID = "Hybrid",
}


export enum Language {
    ENGLISH = "English",
    SPANISH = "Spanish",
    FRENCH = "French",
    GERMAN = "German",
    MANDARIN = "Mandarin",
    HINDI = "Hindi",
    HINGLISH = "Hinglish",
    ARABIC = "Arabic",
    PORTUGUESE = "Portuguese",
}

export enum ContentType {
    VIDEO = "video",
    PDF = "pdf",
    QUIZ = "quiz",
    TEXT = "text",
    AUDIO = "audio",
    ASSIGNMENT = "assignment",
}

export enum CourseStatus {
    DRAFT = "draft",
    PENDING_REVIEW = "pending_review",
    PUBLISHED = "published",
    ARCHIVED = "archived",
    REJECTED = "rejected",
}

export enum Currency {
    INR = "INR",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
}

// ==================== INTERFACES ====================

// Quiz Question Interface
export interface IQuizOption {
    text: string;
    isCorrect: boolean;
}

export interface IQuizQuestion {
    _id?: Types.ObjectId;
    questionText: string;
    options: IQuizOption[];
    correctOptionIndex: number;
    explanation?: string;
    points: number;
}

// Lesson Content Interface (for actual course content - optional)
export interface ILessonContent {
    _id?: Types.ObjectId;
    type: ContentType;
    title: string;
    url?: string;
    textContent?: string;
    duration?: number; // in seconds
    marks?: number; // marks/points for the content
    quizQuestions?: IQuizQuestion[];
    isPreview?: boolean;
    order: number;
}

// Lesson Interface (for actual course content - optional)
export interface ILesson {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    contents: ILessonContent[];
    duration: number; // total duration in minutes
    isPublished: boolean;
    isFree: boolean;
    order: number;
}

// Chapter/Section Interface (for actual course content - optional)
export interface IChapter {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    lessons: ILesson[];
    order: number;
    isPublished: boolean;
}

// ==================== SIMPLIFIED CURRICULUM (for syllabus display) ====================

// Topic - Simple text item for curriculum/syllabus display
export interface ITopic {
    _id?: Types.ObjectId;
    title: string;
    order: number;
}

// Curriculum Section - Contains topics (text only, no files)
export interface ICurriculumSection {
    _id?: Types.ObjectId;
    title: string;
    description?: string;
    topics: ITopic[];
    order: number;
}

// Course Perk Interface
export interface ICoursePerk {
    key: string;
    value: string;
    icon?: string;
}

// Discount Code Interface
export interface IDiscountCode {
    _id?: Types.ObjectId;
    code: string;
    discountPercentage: number;
    maxUses?: number;
    currentUses: number;
    validFrom: Date;
    validTill: Date;
    isActive: boolean;
}

// Course Pricing Interface
export interface ICoursePricing {
    originalPrice: number;
    discountPercentage: number;
    finalPrice: number;
    currency: Currency;
    isGstApplicable: boolean;
    gstPercentage: number;
}


// Course Rating Interface
export interface ICourseRating {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
        five: number;
        four: number;
        three: number;
        two: number;
        one: number;
    };
}

// Course FAQ Interface
export interface ICourseFAQ {
    _id?: Types.ObjectId;
    question: string;
    answer: string;
    order: number;
}

// Course Requirements Interface
export interface ICourseRequirement {
    _id?: Types.ObjectId;
    text: string;
    order: number;
}

// Course Learning Outcomes Interface
export interface ILearningOutcome {
    _id?: Types.ObjectId;
    text: string;
    order: number;
}

// Main Course Interface
export interface ICourse extends Document {
    _id: Types.ObjectId;

    // Basic Information
    title: string;
    slug: string;
    subtitle?: string;
    description: string;
    shortDescription: string;
    coverImage?: string;
    previewVideoUrl?: string;
    thumbnailUrl?: string;

    // Categorization
    category: Types.ObjectId;
    subCategory?: Types.ObjectId;
    tags: string[];

    // Course Details
    level: CourseLevel;
    language: string;
    deliveryMode: DeliveryMode;
    location?: string;
    accessDuration: number; // in days, 0 = lifetime

    // Pricing
    pricing: ICoursePricing;
    discountCodes?: IDiscountCode[];

    // Content
    perks: ICoursePerk[];
    curriculum: string;

    // Ratings & Reviews
    rating: ICourseRating;

    // Enrollment
    totalEnrollments: number;
    maxEnrollments?: number;

    // Instructors
    instructor: Types.ObjectId;
    coInstructors?: Types.ObjectId[];

    // Status & Visibility
    status: CourseStatus;
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt?: Date;

    // SEO
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];

    // Timestamps
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== POPULATED INTERFACES ====================

export interface IPopulatedInstructor {
    _id: Types.ObjectId;
    name: string;
    email: string;
    instructorProfile?: {
        bio?: string;
        expertise?: string[];
        experience?: number;
    };
}

export interface IPopulatedCategory {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    icon?: string;
}

export interface ICoursePopulated extends Omit<ICourse, 'instructor' | 'coInstructors' | 'category' | 'subCategory'> {
    instructor: IPopulatedInstructor;
    coInstructors?: IPopulatedInstructor[];
    category: IPopulatedCategory;
    subCategory?: IPopulatedCategory;
}

// ==================== DTO INTERFACES ====================

export interface CreateCourseDTO {
    title: string;
    subtitle?: string;
    description: string;
    shortDescription: string;
    coverImage?: string;
    previewVideoUrl?: string;
    category: string;
    subCategory?: string;
    tags?: string[];
    level?: CourseLevel;
    language?: string;
    deliveryMode?: DeliveryMode;
    location?: string;
    accessDuration?: number;
    originalPrice: number;
    discountPercentage?: number;
    currency?: Currency;
    isGstApplicable?: boolean;
    instructor: string;
    coInstructors?: string[];
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
    status?: CourseStatus;
    isFeatured?: boolean;
    curriculum?: string; // Markdown text for curriculum/syllabus
}

export interface CourseFilterDTO {
    category?: string;
    subCategory?: string;
    level?: CourseLevel;
    deliveryMode?: DeliveryMode;
    language?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    instructor?: string;
    isFeatured?: boolean;
    status?: CourseStatus;
    search?: string;
}

export interface CoursePaginationDTO {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'price' | 'rating' | 'enrollments' | 'title';
    sortOrder?: 'asc' | 'desc';
}

// ==================== RESPONSE INTERFACES ====================

export interface CourseListResponse {
    courses: ICoursePopulated[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface CourseDetailResponse {
    course: ICoursePopulated;
    relatedCourses?: ICourse[];
}

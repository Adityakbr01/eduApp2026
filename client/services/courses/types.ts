// ==================== ENUMS ====================
import z from "zod";


export enum BatchStatus {
    UPCOMING = "UPCOMING",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
}


export enum CourseLevel {
    BEGINNER = "Beginner",
    INTERMEDIATE = "Intermediate",
    ADVANCED = "Advanced",
}


export enum VideoStatusEnum {
    UPLOADED = "UPLOADED",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED",
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
    UNPUBLISHED = "unpublished",
    ARCHIVED = "archived",
    REJECTED = "rejected",
    APPROVED = "approved",
}

export enum Currency {
    INR = "INR",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
}


export enum SocialLinkType {
    DISCORD = "discord",
    GITHUB = "github",
    YOUTUBE = "youtube",
    WEBSITE = "website",
    OTHER = "other",
}

export interface SocialLink {
    type: SocialLinkType;
    url: string;
    isPublic: boolean;
}


// ==================== INTERFACES ====================

export interface ICoursePricing {
    originalPrice: number;  // Price set by instructor (required)
    price: number;          // Auto-calculated final price
    discountPercentage?: number;
    discountExpiresAt?: string;
    currency: Currency;
    isFree: boolean;
}

export interface IRatingStats {
    averageRating: number;
    totalReviews: number;
    ratingsDistribution: {
        one: number;
        two: number;
        three: number;
        four: number;
        five: number;
    };
}

export interface IVideoContent {
    url?: string;
    duration?: number; // seconds
    minWatchPercent?: number;
    rawKey?: string;
    hlsKey?: string;
    status?: VideoStatusEnum;
    isEmailSent?: boolean;
    _id?: string;
}

export interface IAudioContent {
    url?: string;
    duration?: number; // seconds
}

export interface IPdfContent {
    url?: string;
    totalPages?: number;
}

export interface IAssessmentContent {
    refId?: string;
    type?: "quiz" | "assignment";
}

export interface ILessonContent {
    _id: string;
    title: string;
    type: ContentType;
    marks: number;
    isVisible: boolean;
    isPreview: boolean;
    order: number;
    video?: IVideoContent;
    audio?: IAudioContent;
    pdf?: IPdfContent;
    assessment?: IAssessmentContent;
    deadline?: {
        dueDate?: string;
        startDate?: string;
        penaltyPercent?: number;
    };
    createdAt: string;
    updatedAt: string;
    completed?: boolean;
}

export interface ILesson {
    _id: string;
    id?: string;
    title: string;
    section: string;
    isVisible: boolean;
    order: number;
    contents?: ILessonContent[];
    createdAt: string;
    updatedAt: string;
    completed?: boolean;
}

export interface ISection {
    _id: string;
    title: string;
    course: string;
    isVisible: boolean;
    order: number;
    lessons?: ILesson[];
    createdAt: string;
    updatedAt: string;
    isLocked?: boolean;
    completed?: boolean;
}

export interface ICategoryInfo {
    _id: string;
    name: string;
    slug?: string;
}

// Course stats from aggregation
export interface ICourseStats {
    totalEnrollments: number;
    totalSections: number;
    totalLessons: number;
    totalContents: number;
}


export interface IThumbnail {
    key: string;
    version: number;
}


export interface IBatch {
    _id: string;
    course: string;
    startDate: string;
    endDate: string;
    batchStatus: BatchStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ICourse {
    _id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    instructor: string | IInstructorInfo;
    category: string | ICategoryInfo;
    subCategory: string | ICategoryInfo;
    level: CourseLevel | string;
    language: string;
    deliveryMode: DeliveryMode | string;
    thumbnail?: IThumbnail;
    previewVideoUrl?: string;
    thumbnailUrl?: string;
    pricing?: ICoursePricing;
    tags?: string[];
    accessDuration?: number;
    maxEnrollments?: number;
    totalEnrollments?: number;
    durationWeeks?: number;
    curriculum?: string;
    status: CourseStatus;
    isPublished: boolean;
    isFeatured?: boolean;
    sections?: ISection[];
    ratingStats?: IRatingStats;
    stats?: ICourseStats;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    createdAt: string;
    updatedAt: string;
    batch: IBatch
    mentorSupport: boolean;
    socialLinks?: SocialLink[];
}

export interface IInstructorInfo {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
}

// Course Responses
export interface CourseListData {
    courses: ICourse[];
    total: number;
    page?: number;
    limit?: number;
}

// getCourseById returns ICourse directly in data
export type CourseDetailData = ICourse;

// Section Responses - API returns array directly
export type SectionListData = ISection[];

export interface SectionDetailData {
    section: ISection;
}

// Lesson Responses - API returns array directly
export type LessonListData = ILesson[];

export interface LessonDetailData {
    lesson: ILesson;
}

// Content Responses - API returns array directly
export type ContentListData = ILessonContent[];

export interface ContentDetailData {
    content: ILessonContent;
}

// ==================== DTO INTERFACES ====================
export const batchSchema = z.object({
    startDate: z.string().default(() => new Date().toISOString()),
    endDate: z.string().default(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return date.toISOString();
    }),
    maxStudents: z.number().default(100),
    batchStatus: z.nativeEnum(BatchStatus).default(BatchStatus.UPCOMING),
});

export interface CreateCourseDTO {
    _id?: string;
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    subCategory: string;
    level?: CourseLevel;
    language?: Language;
    deliveryMode?: DeliveryMode;
    thumbnail?: IThumbnail;
    previewVideoUrl?: string;
    thumbnailUrl?: string;
    pricing?: {
        originalPrice: number;  // Required - price set by instructor
        price?: number;         // Optional - auto-calculated by server
        discountPercentage?: number;
        discountExpiresAt?: string;
        currency?: "USD" | "EUR" | "INR" | "GBP";
        isFree?: boolean;
    };
    tags?: string[];
    accessDuration?: number;
    maxEnrollments?: number;
    durationWeeks?: number;
    curriculum?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    batches?: z.infer<typeof batchSchema>[];
    mentorSupport: boolean;
}

export type UpdateCourseDTO = Partial<CreateCourseDTO>;

export interface CreateSectionDTO {
    title: string;
    isVisible?: boolean;
}

export interface UpdateSectionDTO {
    title?: string;
    isVisible?: boolean;
}

export interface CreateLessonDTO {
    title: string;
    isVisible?: boolean;
}

export interface UpdateLessonDTO {
    title?: string;
    isVisible?: boolean;
}

export interface CreateContentDTO {
    title: string;
    type: "video" | "audio" | "pdf" | "assignment" | "quiz";
    marks: number;
    isVisible?: boolean;
    isPreview?: boolean;
    video?: {
        rawKey?: string;
        duration?: number;
        minWatchPercent?: number;
        hlsKey?: string;
        status?: string;
    };
    audio?: {
        rawKey?: string;
        duration?: number;
        status?: string;
    };
    pdf?: {
        rawKey?: string;
        totalPages?: number;
        status?: string;
    };
    assessment?: {
        refId?: string;
        type?: "quiz" | "assignment";
    };
    deadline?: {
        dueDate?: string;
        startDate?: string;
        penaltyPercent?: number;
    };
}

export type UpdateContentDTO = Partial<CreateContentDTO>;

export interface ReorderItemDTO {
    id: string;
    order: number;
}

// ==================== COUPON TYPES ====================

export enum CouponType {
    PERCENTAGE = "percentage",
    FIXED_AMOUNT = "fixed_amount",
}

export enum CouponStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    EXHAUSTED = "exhausted",
}

export enum CouponScope {
    ALL_COURSES = "all_courses",
    SPECIFIC_COURSES = "specific_courses",
    SPECIFIC_CATEGORIES = "specific_categories",
    SPECIFIC_INSTRUCTORS = "specific_instructors",
}

export interface ICourseCoupon {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: CouponType;
    discountValue: number;
    maxDiscountAmount?: number;
    minPurchaseAmount: number;
    currency: string;
    scope: CouponScope;
    applicableCourses?: string[];
    applicableCategories?: string[];
    excludedCourses?: string[];
    startDate: string;
    endDate: string;
    usageLimit?: number;
    usageLimitPerUser: number;
    timesUsed: number;
    firstPurchaseOnly: boolean;
    status: CouponStatus;
    isValid?: boolean;
    remainingUses?: number | null;
    createdAt: string;
    updatedAt: string;
}

// ==================== REVIEW TYPES ====================

export enum ReviewStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged",
}

export interface IDetailedRatings {
    contentQuality?: number;
    instructorSkills?: number;
    valueForMoney?: number;
    courseStructure?: number;
    practicalApplication?: number;
}

export interface IInstructorResponse {
    content: string;
    respondedAt: string;
    respondedBy: string;
}

export interface ICourseReview {
    _id: string;
    course: string;
    user: string | IInstructorInfo;
    enrollment?: string;
    rating: number;
    title?: string;
    content: string;
    detailedRatings?: IDetailedRatings;
    status: ReviewStatus;
    helpfulVotes: number;
    notHelpfulVotes: number;
    instructorResponse?: IInstructorResponse;
    isVerifiedPurchase: boolean;
    courseCompletionPercentage: number;
    isEdited: boolean;
    helpfulnessScore?: number;
    averageDetailedRating?: number;
    createdAt: string;
    updatedAt: string;
}

// Review DTOs
export interface CreateReviewDTO {
    rating: number;
    title?: string;
    content: string;
    detailedRatings?: IDetailedRatings;
}

export interface UpdateReviewDTO {
    rating?: number;
    title?: string;
    content?: string;
    detailedRatings?: IDetailedRatings;
}

export interface ReviewListData {
    reviews: ICourseReview[];
    total: number;
    page?: number;
    limit?: number;
}




export interface AdminCourse {
    _id: string;
    title: string;
    description: string;

    // Optional request info
    requestId?: string; // ID of the pending request
    requestType?: "published" | "unpublished"; // type of request
    requestStatus?: "pending_review" | "approved" | "rejected"; // status of request
    requestCreatedAt?: string; // when the request was created

    status: "draft" | "published" | "pending_review"; // course status
    isPublished: boolean;
    isFeatured?: boolean; // Featured course status
    createdAt: string;

    category: {
        _id: string;
        name: string;
        slug: string;
    };

    instructor: {
        _id: string;
        name: string;
        email: string;
        avatar?: string; // optional avatar
    };
}


export interface AdminCoursesResponse {
    success: boolean;
    courses: AdminCourse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
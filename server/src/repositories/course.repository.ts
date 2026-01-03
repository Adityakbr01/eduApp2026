import { Types } from "mongoose";
import { CourseModel } from "src/models/course/course.model.js";
import type { ICourse, CourseFilterDTO, CoursePaginationDTO } from "src/types/course.type.js";
import { CourseStatus } from "src/types/course.type.js";

export const courseRepository = {
    // ==================== CREATE ====================
    create: async (data: Partial<ICourse>) => {
        return CourseModel.create(data);
    },

    // ==================== FIND BY ID ====================
    findById: async (courseId: string) => {
        return CourseModel.findById(courseId);
    },

    findByIdPopulated: async (courseId: string) => {
        return CourseModel.findById(courseId)
            .populate("instructor", "name email instructorProfile")
            .populate("coInstructors", "name email instructorProfile")
            .populate("category", "name slug icon")
            .populate("subCategory", "name slug icon");
    },

    findByIdLean: async (courseId: string) => {
        return CourseModel.findById(courseId).lean();
    },

    // ==================== FIND BY SLUG ====================
    findBySlug: async (slug: string) => {
        return CourseModel.findOne({ slug })
            .populate("instructor", "name email instructorProfile")
            .populate("coInstructors", "name email instructorProfile")
            .populate("category", "name slug icon")
            .populate("subCategory", "name slug icon");
    },

    findPublishedBySlug: async (slug: string) => {
        return CourseModel.findOne({ slug, isPublished: true, status: CourseStatus.PUBLISHED })
            .populate("instructor", "name email instructorProfile")
            .populate("coInstructors", "name email instructorProfile")
            .populate("category", "name slug icon")
            .populate("subCategory", "name slug icon");
    },

    // ==================== FIND MANY ====================
    findAll: async (
        filter: CourseFilterDTO = {},
        pagination: CoursePaginationDTO = {}
    ) => {
        const {
            category,
            subCategory,
            level,
            deliveryMode,
            language,
            minPrice,
            maxPrice,
            minRating,
            instructor,
            isFeatured,
            status,
            search,
        } = filter;

        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = pagination;

        const query: Record<string, any> = {};

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Filters
        if (category) query.category = new Types.ObjectId(category);
        if (subCategory) query.subCategory = new Types.ObjectId(subCategory);
        if (level) query.level = level;
        if (deliveryMode) query.deliveryMode = deliveryMode;
        if (language) query.language = { $regex: language, $options: "i" };
        if (instructor) query.instructor = new Types.ObjectId(instructor);
        if (typeof isFeatured === "boolean") query.isFeatured = isFeatured;
        if (status) query.status = status;

        // Price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            query["pricing.finalPrice"] = {};
            if (minPrice !== undefined) query["pricing.finalPrice"].$gte = minPrice;
            if (maxPrice !== undefined) query["pricing.finalPrice"].$lte = maxPrice;
        }

        // Rating filter
        if (minRating !== undefined) {
            query["rating.averageRating"] = { $gte: minRating };
        }

        const skip = (page - 1) * limit;

        // Sort options
        const sortOptions: Record<string, 1 | -1> = {};
        switch (sortBy) {
            case "price":
                sortOptions["pricing.finalPrice"] = sortOrder === "asc" ? 1 : -1;
                break;
            case "rating":
                sortOptions["rating.averageRating"] = sortOrder === "asc" ? 1 : -1;
                break;
            case "enrollments":
                sortOptions.totalEnrollments = sortOrder === "asc" ? 1 : -1;
                break;
            case "title":
                sortOptions.title = sortOrder === "asc" ? 1 : -1;
                break;
            default:
                sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
        }

        const [courses, totalItems] = await Promise.all([
            CourseModel.find(query)
                .populate("instructor", "name email instructorProfile")
                .populate("category", "name slug icon")
                .populate("subCategory", "name slug icon")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            CourseModel.countDocuments(query),
        ]);

        return {
            courses,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1,
            },
        };
    },

    // ==================== FIND PUBLISHED COURSES ====================
    findPublished: async (pagination: CoursePaginationDTO = {}) => {
        return courseRepository.findAll(
            { status: CourseStatus.PUBLISHED },
            pagination
        );
    },

    // ==================== FIND FEATURED COURSES ====================
    findFeatured: async (limit = 10) => {
        return CourseModel.find({ isFeatured: true, isPublished: true })
            .populate("instructor", "name email instructorProfile")
            .populate("category", "name slug icon")
            .sort({ totalEnrollments: -1 })
            .limit(limit)
            .lean();
    },

    // ==================== FIND BY INSTRUCTOR ====================
    findByInstructor: async (instructorId: string, includeUnpublished = false) => {
        const query: Record<string, any> = {
            $or: [
                { instructor: new Types.ObjectId(instructorId) },
                { coInstructors: new Types.ObjectId(instructorId) },
            ],
        };

        if (!includeUnpublished) {
            query.isPublished = true;
        }

        return CourseModel.find(query)
            .populate("category", "name slug icon")
            .sort({ createdAt: -1 })
            .lean();
    },

    // ==================== FIND BY CATEGORY ====================
    findByCategory: async (categoryId: string, pagination: CoursePaginationDTO = {}) => {
        return courseRepository.findAll(
            { category: categoryId, status: CourseStatus.PUBLISHED },
            pagination
        );
    },

    // ==================== UPDATE ====================
    updateById: async (courseId: string, data: Partial<ICourse>) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $set: data },
            { new: true, runValidators: true }
        );
    },

    // ==================== DELETE ====================
    deleteById: async (courseId: string) => {
        return CourseModel.findByIdAndDelete(courseId);
    },

    softDeleteById: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $set: { status: CourseStatus.ARCHIVED, isPublished: false } },
            { new: true }
        );
    },

    // ==================== STATUS UPDATES ====================
    publishCourse: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    status: CourseStatus.PUBLISHED,
                    isPublished: true,
                    publishedAt: new Date(),
                },
            },
            { new: true }
        );
    },

    unpublishCourse: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    status: CourseStatus.DRAFT,
                    isPublished: false,
                },
            },
            { new: true }
        );
    },

    submitForReview: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $set: { status: CourseStatus.PENDING_REVIEW } },
            { new: true }
        );
    },

    rejectCourse: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $set: { status: CourseStatus.REJECTED, isPublished: false } },
            { new: true }
        );
    },

    // ==================== FEATURE TOGGLE ====================
    toggleFeatured: async (courseId: string) => {
        const course = await CourseModel.findById(courseId);
        if (!course) return null;

        return CourseModel.findByIdAndUpdate(
            courseId,
            { $set: { isFeatured: !course.isFeatured } },
            { new: true }
        );
    },

    // ==================== ENROLLMENT COUNT ====================
    incrementEnrollment: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $inc: { totalEnrollments: 1 } },
            { new: true }
        );
    },

    decrementEnrollment: async (courseId: string) => {
        return CourseModel.findByIdAndUpdate(
            courseId,
            { $inc: { totalEnrollments: -1 } },
            { new: true }
        );
    },

    // ==================== OWNERSHIP CHECK ====================
    isOwner: async (courseId: string, userId: string): Promise<boolean> => {
        const course = await CourseModel.findById(courseId).select("instructor coInstructors").lean();
        if (!course) return false;

        const instructorId = course.instructor.toString();
        const coInstructorIds = course.coInstructors?.map((id) => id.toString()) || [];

        return instructorId === userId || coInstructorIds.includes(userId);
    },

    // ==================== STATS ====================
    getInstructorStats: async (instructorId: string) => {
        const stats = await CourseModel.aggregate([
            {
                $match: {
                    $or: [
                        { instructor: new Types.ObjectId(instructorId) },
                        { coInstructors: new Types.ObjectId(instructorId) },
                    ],
                },
            },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    publishedCourses: {
                        $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
                    },
                    draftCourses: {
                        $sum: { $cond: [{ $eq: ["$status", CourseStatus.DRAFT] }, 1, 0] },
                    },
                    totalEnrollments: { $sum: "$totalEnrollments" },
                    averageRating: { $avg: "$rating.averageRating" },
                },
            },
        ]);

        return stats[0] || {
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            totalEnrollments: 0,
            averageRating: 0,
        };
    },

    // Get detailed instructor metrics for dashboard
    getInstructorMetrics: async (instructorId: string) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [basicStats, coursesByStatus, recentCourses, topCourses] = await Promise.all([
            // Basic stats
            CourseModel.aggregate([
                {
                    $match: {
                        $or: [
                            { instructor: new Types.ObjectId(instructorId) },
                            { coInstructors: new Types.ObjectId(instructorId) },
                        ],
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalCourses: { $sum: 1 },
                        publishedCourses: { $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] } },
                        draftCourses: { $sum: { $cond: [{ $eq: ["$status", CourseStatus.DRAFT] }, 1, 0] } },
                        pendingReviewCourses: { $sum: { $cond: [{ $eq: ["$status", CourseStatus.PENDING_REVIEW] }, 1, 0] } },
                        archivedCourses: { $sum: { $cond: [{ $eq: ["$status", CourseStatus.ARCHIVED] }, 1, 0] } },
                        totalEnrollments: { $sum: "$totalEnrollments" },
                        totalRatings: { $sum: "$rating.totalRatings" },
                        averageRating: { $avg: "$rating.averageRating" },
                    },
                },
            ]),

            // Courses by status
            CourseModel.aggregate([
                {
                    $match: {
                        $or: [
                            { instructor: new Types.ObjectId(instructorId) },
                            { coInstructors: new Types.ObjectId(instructorId) },
                        ],
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),

            // Recently updated courses
            CourseModel.find({
                $or: [
                    { instructor: new Types.ObjectId(instructorId) },
                    { coInstructors: new Types.ObjectId(instructorId) },
                ],
            })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select("_id title status totalEnrollments rating.averageRating updatedAt slug")
                .lean(),

            // Top performing courses by enrollments
            CourseModel.find({
                $or: [
                    { instructor: new Types.ObjectId(instructorId) },
                    { coInstructors: new Types.ObjectId(instructorId) },
                ],
                isPublished: true,
            })
                .sort({ totalEnrollments: -1 })
                .limit(5)
                .select("_id title totalEnrollments rating.averageRating pricing.finalPrice slug")
                .lean(),
        ]);

        const stats = basicStats[0] || {
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            pendingReviewCourses: 0,
            archivedCourses: 0,
            totalEnrollments: 0,
            totalRatings: 0,
            averageRating: 0,
            totalLessons: 0,
            totalDuration: 0,
        };

        // Format courses by status
        const statusMap: Record<string, number> = {};
        coursesByStatus.forEach((item: { _id: string; count: number }) => {
            statusMap[item._id] = item.count;
        });

        return {
            overview: {
                totalCourses: stats.totalCourses,
                publishedCourses: stats.publishedCourses,
                draftCourses: stats.draftCourses,
                pendingReviewCourses: stats.pendingReviewCourses,
                archivedCourses: stats.archivedCourses,
                totalEnrollments: stats.totalEnrollments,
                totalRatings: stats.totalRatings,
                averageRating: stats.averageRating || 0,
                totalLessons: stats.totalLessons,
                totalDuration: stats.totalDuration,
                publishRate: stats.totalCourses > 0
                    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
                    : 0,
            },
            coursesByStatus: statusMap,
            recentCourses,
            topCourses,
        };
    },

    // ==================== CHECK EXISTS ====================
    exists: async (courseId: string): Promise<boolean> => {
        const count = await CourseModel.countDocuments({ _id: courseId });
        return count > 0;
    },

    existsBySlug: async (slug: string): Promise<boolean> => {
        const count = await CourseModel.countDocuments({ slug });
        return count > 0;
    },
};

export default courseRepository;

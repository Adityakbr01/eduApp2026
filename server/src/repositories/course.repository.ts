import type { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import Course from "src/models/course/course.model.js";
import { CourseStatus } from "src/types/course.type.js";

// ============================================
// COURSE REPOSITORY
// ============================================
export const courseRepository = {

    // Find all published courses with aggregated stats
    findAllPublished: async (
        query: {
            page?: number;
            limit?: number;
            search?: string;
            category?: string;
            subCategory?: string;
        } = {}
    ) => {
        const { page = 1, limit = 10, search, category, subCategory } = query;
        const skip = (page - 1) * limit;
        const matchFilter: any = { isPublished: true, "Deleted.isDeleted": { $ne: true } };

        if (search) {
            matchFilter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (category) matchFilter.category = new Types.ObjectId(category);
        if (subCategory) matchFilter.subCategory = new Types.ObjectId(subCategory);

        const [result, countResult] = await Promise.all([
            Course.aggregate([
                { $match: matchFilter },
                { $sort: { publishedAt: -1, createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },

                // Lookup sections count
                {
                    $lookup: {
                        from: "sections",
                        let: { courseId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                            { $count: "count" }
                        ],
                        as: "sectionStats"
                    }
                },

                // Lookup lessons count
                {
                    $lookup: {
                        from: "lessons",
                        let: { courseId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                            { $count: "count" }
                        ],
                        as: "lessonStats"
                    }
                },

                // Lookup lesson contents count
                {
                    $lookup: {
                        from: "lessoncontents",
                        let: { courseId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                            { $count: "count" }
                        ],
                        as: "contentStats"
                    }
                },

                // Lookup instructor
                {
                    $lookup: {
                        from: "users",
                        localField: "instructor",
                        foreignField: "_id",
                        pipeline: [
                            { $project: { name: 1, avatar: 1 } }
                        ],
                        as: "instructor"
                    }
                },
                { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },

                // Lookup category
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        pipeline: [
                            { $project: { name: 1, slug: 1 } }
                        ],
                        as: "category"
                    }
                },
                { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

                // Lookup subCategory
                {
                    $lookup: {
                        from: "categories",
                        localField: "subCategory",
                        foreignField: "_id",
                        pipeline: [
                            { $project: { name: 1, slug: 1 } }
                        ],
                        as: "subCategory"
                    }
                },
                { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },

                // Add computed stats fields
                {
                    $addFields: {
                        stats: {
                            totalEnrollments: { $ifNull: ["$totalEnrollments", 0] },
                            totalSections: {
                                $ifNull: [{ $arrayElemAt: ["$sectionStats.count", 0] }, 0]
                            },
                            totalLessons: {
                                $ifNull: [{ $arrayElemAt: ["$lessonStats.count", 0] }, 0]
                            },
                            totalContents: {
                                $ifNull: [{ $arrayElemAt: ["$contentStats.count", 0] }, 0]
                            }
                        }
                    }
                },

                // Remove temporary lookup arrays
                {
                    $project: {
                        sectionStats: 0,
                        lessonStats: 0,
                        contentStats: 0
                    }
                }
            ]),
            Course.countDocuments(matchFilter),
        ]);

        return {
            courses: result,
            pagination: {
                page,
                limit,
                total: countResult,
                totalPages: Math.ceil(countResult / limit),
            },
        };
    },

    // Find published course by ID or Slug with aggregated stats
    findPublishedById: async (idOrSlug: string | Types.ObjectId) => {
        // Check if it's a valid ObjectId, if not, treat as slug
        const isObjectId = Types.ObjectId.isValid(idOrSlug) &&
            (typeof idOrSlug === 'string' ? idOrSlug.length === 24 : true);

        const matchQuery = isObjectId
            ? { _id: new Types.ObjectId(idOrSlug as string), isPublished: true, "Deleted.isDeleted": { $ne: true } }
            : { slug: idOrSlug, isPublished: true, "Deleted.isDeleted": { $ne: true } };

        const result = await Course.aggregate([
            // Match the course
            { $match: matchQuery },

            // Lookup sections count
            {
                $lookup: {
                    from: "sections",
                    let: { courseId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                        { $count: "count" }
                    ],
                    as: "sectionStats"
                }
            },

            // Lookup lessons count
            {
                $lookup: {
                    from: "lessons",
                    let: { courseId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                        { $count: "count" }
                    ],
                    as: "lessonStats"
                }
            },

            // Lookup lesson contents count
            {
                $lookup: {
                    from: "lessoncontents",
                    let: { courseId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                        { $count: "count" }
                    ],
                    as: "contentStats"
                }
            },

            // Lookup instructor
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1, email: 1, avatar: 1, fullName: 1, profileImage: 1 } }
                    ],
                    as: "instructor"
                }
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },

            // Lookup category
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1, slug: 1 } }
                    ],
                    as: "category"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

            // Lookup subCategory
            {
                $lookup: {
                    from: "categories",
                    localField: "subCategory",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { name: 1, slug: 1 } }
                    ],
                    as: "subCategory"
                }
            },
            { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },

            // Add computed stats fields
            {
                $addFields: {
                    stats: {
                        totalEnrollments: { $ifNull: ["$totalEnrollments", 0] },
                        totalSections: {
                            $ifNull: [{ $arrayElemAt: ["$sectionStats.count", 0] }, 0]
                        },
                        totalLessons: {
                            $ifNull: [{ $arrayElemAt: ["$lessonStats.count", 0] }, 0]
                        },
                        totalContents: {
                            $ifNull: [{ $arrayElemAt: ["$contentStats.count", 0] }, 0]
                        }
                    }
                }
            },

            // Remove temporary lookup arrays
            {
                $project: {
                    sectionStats: 0,
                    lessonStats: 0,
                    contentStats: 0
                }
            }
        ]);

        return result.length > 0 ? result[0] : null;
    },

    // Find basic course details (lightweight)
    findBasicDetails: async (idOrSlug: string | Types.ObjectId) => {
        const isObjectId = Types.ObjectId.isValid(idOrSlug) &&
            (typeof idOrSlug === 'string' ? idOrSlug.length === 24 : true);

        const query = isObjectId
            ? { _id: new Types.ObjectId(idOrSlug as string) }
            : { slug: idOrSlug };

        return Course.findOne({
            ...query,
            isPublished: true,
            "Deleted.isDeleted": { $ne: true }
        }).select("pricing instructor coInstructors isPublished");
    },
    // Create
    create: async (data: any) => {
        console.log("Creating course with data:", data);
        return Course.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return Course.findById(id);
    },

    // Find by ID with populate
    findByIdWithDetails: async (id: string | Types.ObjectId) => {
        return Course.findById(id)
            .populate("instructor", "name email avatar")
            .populate("category", "name slug")
            .populate("subCategory", "name slug");
    },

    // Find by slug
    findBySlug: async (slug: string) => {
        return Course.findOne({ slug });
    },

    // Find featured courses
    findFeaturedCourses: async (limit: number = 5) => {
        return Course.find({
            isPublished: true,
            isFeatured: true,
            "Deleted.isDeleted": { $ne: true }
        })
            .sort({ order: 1 })
            .limit(limit)
            .populate("instructor", "name avatar")
            .populate("category", "name slug")
            .populate("subCategory", "name slug")
            .lean();
    },

    // Find all courses by instructor
    findByInstructor: async (
        instructorId: string | Types.ObjectId,
        query: {
            page?: number;
            limit?: number;
            status?: string;
            search?: string;
        } = {}
    ) => {
        const { page = 1, limit = 10, status, search } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<any> = { instructor: instructorId, "Deleted.isDeleted": { $ne: true } };

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const [courses, total] = await Promise.all([
            Course.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("category", "name slug")
                .lean(),
            Course.countDocuments(filter),
        ]);

        return {
            courses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>, session?: any) => {
        console.log("Updating course with data:", data);
        return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true, session });
    },

    // Delete by ID (soft delete)
    deleteById: async (id: string | Types.ObjectId, userId: string | Types.ObjectId) => {
        return Course.findByIdAndUpdate(
            id,
            {
                "Deleted.isDeleted": true,
                "Deleted.deletedAt": new Date(),
                "Deleted.deletedBy": userId
            },
            { new: true }
        );
    },

    // Check if slug exists
    slugExists: async (slug: string, excludeId?: string | Types.ObjectId) => {
        const filter: FilterQuery<any> = { slug };
        if (excludeId) filter._id = { $ne: excludeId };
        return Course.exists(filter);
    },

    // Publish/Unpublish course
    updatePublishStatus: async (
        id: string | Types.ObjectId,
        status: CourseStatus
    ) => {
        const updateData: any = { status };

        if (status === CourseStatus.PUBLISHED) {
            updateData.isPublished = true;
            updateData.publishedAt = new Date();
        } else if (status === CourseStatus.DRAFT) {
            updateData.isPublished = false;
            updateData.publishedAt = null;
        } else if (status === CourseStatus.REJECTED) {
            updateData.isPublished = false;
        }

        return Course.findByIdAndUpdate(id, updateData, { new: true });
    },
    // Check ownership
    isOwner: async (courseId: string | Types.ObjectId, instructorId: string | Types.ObjectId) => {
        const course = await Course.findOne({
            _id: courseId,
            $or: [
                { instructor: instructorId },
                { coInstructors: instructorId }
            ]
        });
        return !!course;
    },

    // Bulk write operations
    bulkWrite: async (ops: any[]) => {
        return Course.bulkWrite(ops);
    },

    // -------------------- FIND COURSES FOR ADMIN WITH PAGINATION AND FILTERING WITH REGEX --------------------
    findForAdmin: async (
        query: {
            page?: number;
            limit?: number;
            status?: string;
            search?: string;
        } = {}
    ) => {
        const { page = 1, limit = 10, status, search } = query;
        const skip = (page - 1) * limit;

        /* ------------------------------ match ------------------------------ */
        const match: Record<string, any> = { "Deleted.isDeleted": { $ne: true } };

        if (status) match.status = status;

        if (search) {
            const regex = new RegExp(search, "i");
            match.$or = [{ title: regex }, { description: regex }];
        }

        /* ----------------------------- pipeline ---------------------------- */
        const pipeline: PipelineStage[] = [
            { $match: match },
            { $sort: { order: 1 } },
            { $skip: skip },
            { $limit: limit },

            /* --------------------------- instructor --------------------------- */
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                },
            },
            { $unwind: "$instructor" },

            /* ---------------------------- category ---------------------------- */
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },

            /* --------------------- course status request ---------------------- */
            {
                $lookup: {
                    from: "coursestatusrequests",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$course", "$$courseId"] },
                                        {
                                            $eq: [
                                                "$status",
                                                CourseStatus.PENDING_REVIEW,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                type: 1,
                                status: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                    as: "statusRequest",
                },
            },
            {
                $unwind: {
                    path: "$statusRequest",
                    preserveNullAndEmptyArrays: true,
                },
            },

            /* ----------------------------- project ---------------------------- */
            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    isPublished: 1,
                    isFeatured: 1,
                    createdAt: 1,
                    liveStreamingEnabled: 1,

                    // 🔑 review info
                    requestId: "$statusRequest._id",
                    requestType: "$statusRequest.type",
                    requestStatus: "$statusRequest.status",
                    requestCreatedAt: "$statusRequest.createdAt",

                    instructor: {
                        _id: "$instructor._id",
                        name: "$instructor.name",
                        email: "$instructor.email",
                        avatar: "$instructor.avatar",
                    },

                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                    },
                },
            },
        ];

        /* ------------------------------ run ------------------------------ */
        const courses = await Course.aggregate(pipeline);

        const total = await Course.countDocuments(match);

        return {
            courses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
};






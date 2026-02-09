import mongoose from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import Course from "src/models/course/course.model.js";
import {
    contentAttemptRepository
} from "src/repositories/contentAttempt.repository.js";
import AppError from "src/utils/AppError.js";


// ============================================
// COURSE PROGRESS SERVICE (AGGREGATION API)
// ============================================
export const courseProgressService = {
    // -------------------- GET FULL COURSE WITH PROGRESS --------------------
    getCourseWithProgress: async (userId: string, courseId: string) => {
        const courseObjectId = new mongoose.Types.ObjectId(courseId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Aggregation pipeline for full course structure with progress overlay
        const result = await Course.aggregate([
            // Match the specific course
            { $match: { _id: courseObjectId, isPublished: true } },

            // Lookup sections
            {
                $lookup: {
                    from: "sections",
                    let: { courseId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$courseId", "$$courseId"] },
                                isVisible: true,
                            },
                        },
                        { $sort: { order: 1 } },

                        // Lookup lessons for each section
                        {
                            $lookup: {
                                from: "lessons",
                                let: { sectionId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$sectionId", "$$sectionId"] },
                                            isVisible: true,
                                        },
                                    },
                                    { $sort: { order: 1 } },

                                    // Lookup lesson contents
                                    {
                                        $lookup: {
                                            from: "lessoncontents",
                                            let: { lessonId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ["$lessonId", "$$lessonId"] },
                                                        isVisible: true,
                                                    },
                                                },
                                                { $sort: { order: 1 } },

                                                // Lookup user progress for each content
                                                {
                                                    $lookup: {
                                                        from: "contentattempts",
                                                        let: { contentId: "$_id" },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: {
                                                                        $and: [
                                                                            { $eq: ["$contentId", "$$contentId"] },
                                                                            { $eq: ["$userId", userObjectId] },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                        as: "progress",
                                                    },
                                                },

                                                // Flatten progress (single document)
                                                {
                                                    $addFields: {
                                                        userProgress: { $arrayElemAt: ["$progress", 0] },
                                                    },
                                                },
                                                { $project: { progress: 0 } },
                                            ],
                                            as: "contents",
                                        },
                                    },
                                ],
                                as: "lessons",
                            },
                        },
                    ],
                    as: "sections",
                },
            },

            // Calculate totals
            {
                $addFields: {
                    totalMarks: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $reduce: {
                                                            input: "$$this.contents",
                                                            initialValue: 0,
                                                            in: { $add: ["$$value", { $ifNull: ["$$this.marks", 0] }] },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    obtainedMarks: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $reduce: {
                                                            input: "$$this.contents",
                                                            initialValue: 0,
                                                            in: {
                                                                $add: [
                                                                    "$$value",
                                                                    { $ifNull: ["$$this.userProgress.obtainedMarks", 0] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    totalContents: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: { $add: ["$$value", { $size: "$$this.contents" }] },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedContents: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.userProgress.isCompleted", true] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    // Assignment counts
                    totalAssignments: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.type", "assignment"] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedAssignments: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$content.type", "assignment"] },
                                                                        { $eq: ["$$content.userProgress.isCompleted", true] },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    // Video counts
                    totalVideos: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: { $eq: ["$$content.type", "video"] },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    completedVideos: {
                        $reduce: {
                            input: "$sections",
                            initialValue: 0,
                            in: {
                                $add: [
                                    "$$value",
                                    {
                                        $reduce: {
                                            input: "$$this.lessons",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$$this.contents",
                                                                as: "content",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$content.type", "video"] },
                                                                        { $eq: ["$$content.userProgress.isCompleted", true] },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // Calculate percentage
            {
                $addFields: {
                    progressPercentage: {
                        $cond: {
                            if: { $eq: ["$totalContents", 0] },
                            then: 0,
                            else: {
                                $multiply: [{ $divide: ["$completedContents", "$totalContents"] }, 100],
                            },
                        },
                    },
                    marksPercentage: {
                        $cond: {
                            if: { $eq: ["$totalMarks", 0] },
                            then: 0,
                            else: {
                                $multiply: [{ $divide: ["$obtainedMarks", "$totalMarks"] }, 100],
                            },
                        },
                    },
                },
            },

            // Populate instructor
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
                },
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },

            // Populate category
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [{ $project: { name: 1, slug: 1 } }],
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        ]);

        if (!result || result.length === 0) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return result[0];
    },

    // -------------------- GET RESUME INFO (CONTINUE LEARNING) --------------------
    // 🚀 ULTRA-OPTIMIZED: Uses aggregation pipeline (single DB hit)
    getResumeInfo: async (userId: string, courseId: string) => {
        const latestAttempt = await contentAttemptRepository.getLatestAttempt(userId, courseId);

        // No progress exists - return null safely
        if (!latestAttempt) {
            return null;
        }

        // Data already flattened from aggregation pipeline
        const { content, lesson, section, course } = latestAttempt as any;

        return {
            // Resume identifiers
            lessonId: latestAttempt.lessonId || null,
            contentId: latestAttempt.contentId || null,
            courseId: latestAttempt.courseId || null,

            // Resume position
            resumeAt: latestAttempt.resumeAt || 0,
            totalDuration: latestAttempt.totalDuration || 0,
            resumePercentage: latestAttempt.totalDuration
                ? Math.round((latestAttempt.resumeAt / latestAttempt.totalDuration) * 100)
                : 0,

            // Content details
            contentTitle: content?.title || null,
            contentType: content?.type || null,
            contentOrder: content?.order || 0,

            // Lesson details
            lessonTitle: lesson?.title || null,
            lessonOrder: lesson?.order || 0,

            // Section details (for navigation context)
            sectionTitle: section?.title || null,
            sectionOrder: section?.order || 0,

            // Course details
            courseTitle: course?.title || null,
            courseSlug: course?.slug || null,

            // Progress status
            isCompleted: latestAttempt.isCompleted,
            obtainedMarks: latestAttempt.obtainedMarks || 0,
            totalMarks: latestAttempt.totalMarks || 0,

            // Timestamps
            lastAccessedAt: latestAttempt.lastAccessedAt,
        };
    },
};

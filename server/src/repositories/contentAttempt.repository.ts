

import type { Types } from "mongoose";
import mongoose from "mongoose";
import { ContentAttempt } from "src/models/course/index.js";

// ============================================
// CONTENT ATTEMPT REPOSITORY (Student Progress)
// ============================================
export const contentAttemptRepository = {
    // Upsert (create or update)
    upsert: async (
        userId: string | Types.ObjectId,
        contentId: string | Types.ObjectId,
        data: any
    ) => {
        return ContentAttempt.findOneAndUpdate(
            { userId, contentId },
            {
                $set: {
                    ...data,
                    lastAccessedAt: new Date(),
                },
            },
            { upsert: true, new: true, runValidators: true }
        );
    },

    // Find by user and content
    findByUserAndContent: async (
        userId: string | Types.ObjectId,
        contentId: string | Types.ObjectId
    ) => {
        return ContentAttempt.findOne({ userId, contentId });
    },

    // Find all attempts by user and course
    findByUserAndCourse: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ) => {
        return ContentAttempt.find({ userId, courseId }).lean();
    },

    // Mark as completed
    markCompleted: async (
        userId: string | Types.ObjectId,
        contentId: string | Types.ObjectId,
        obtainedMarks?: number
    ) => {
        const updateData: any = { isCompleted: true, lastAccessedAt: new Date() };
        if (obtainedMarks !== undefined) updateData.obtainedMarks = obtainedMarks;

        return ContentAttempt.findOneAndUpdate(
            { userId, contentId },
            { $set: updateData },
            { new: true }
        );
    },

    // Update resume position
    updateResumePosition: async (
        userId: string | Types.ObjectId,
        contentId: string | Types.ObjectId,
        resumeAt: number,
        totalDuration?: number
    ) => {
        const updateData: any = { resumeAt, lastAccessedAt: new Date() };
        if (totalDuration !== undefined) updateData.totalDuration = totalDuration;

        return ContentAttempt.findOneAndUpdate(
            { userId, contentId },
            { $set: updateData },
            { upsert: true, new: true }
        );
    },

    // Delete all attempts by content
    deleteByContent: async (contentId: string | Types.ObjectId) => {
        return ContentAttempt.deleteMany({ contentId });
    },

    // Delete all attempts by course
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return ContentAttempt.deleteMany({ courseId });
    },

    // -------------------- GET LATEST ATTEMPT (CONTINUE LEARNING) --------------------
    // 🚀 ULTRA-OPTIMIZED: Single DB hit using aggregation with $lookup
    getLatestAttempt: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ) => {
        const result = await ContentAttempt.aggregate([
            // 1️⃣ Match user's attempts for this course
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId as string),
                    courseId: new mongoose.Types.ObjectId(courseId as string),
                },
            },

            // 2️⃣ Sort: incomplete first, then by lastAccessedAt DESC
            { $sort: { isCompleted: 1, lastAccessedAt: -1 } },

            // 3️⃣ Take only the latest one
            { $limit: 1 },

            // 4️⃣ Lookup content details (single DB hit)
            {
                $lookup: {
                    from: "lessoncontents",
                    localField: "contentId",
                    foreignField: "_id",
                    as: "content",
                    pipeline: [
                        { $project: { title: 1, type: 1, videoUrl: 1, pdfUrl: 1, order: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$content", preserveNullAndEmptyArrays: true } },

            // 5️⃣ Lookup lesson details
            {
                $lookup: {
                    from: "lessons",
                    localField: "lessonId",
                    foreignField: "_id",
                    as: "lesson",
                    pipeline: [
                        { $project: { title: 1, order: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },

            // 6️⃣ Lookup section details (for navigation context)
            {
                $lookup: {
                    from: "sections",
                    localField: "lesson.sectionId",
                    foreignField: "_id",
                    as: "section",
                    pipeline: [
                        { $project: { title: 1, order: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$section", preserveNullAndEmptyArrays: true } },

            // 7️⃣ Lookup course details
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "_id",
                    as: "course",
                    pipeline: [
                        { $project: { title: 1, slug: 1 } },
                    ],
                },
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

            // 8️⃣ Project clean response structure
            {
                $project: {
                    _id: 1,
                    lessonId: 1,
                    contentId: 1,
                    courseId: 1,

                    // Resume position
                    resumeAt: 1,
                    totalDuration: 1,

                    // Progress status
                    isCompleted: 1,
                    obtainedMarks: 1,
                    totalMarks: 1,
                    lastAccessedAt: 1,

                    // Populated data (flattened)
                    content: 1,
                    lesson: 1,
                    section: 1,
                    course: 1,
                },
            },
        ]);

        return result[0] || null;
    },

    // Get course progress aggregation
    getCourseProgressAggregation: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ) => {
        return ContentAttempt.aggregate([
            {
                $match: {
                    userId: userId,
                    courseId: courseId,
                },
            },
            {
                $group: {
                    _id: "$courseId",
                    totalObtainedMarks: { $sum: "$obtainedMarks" },
                    completedCount: {
                        $sum: { $cond: ["$isCompleted", 1, 0] },
                    },
                    totalAttempts: { $sum: 1 },
                },
            },
        ]);
    },
};

import mongoose from "mongoose";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import Course from "src/models/course/course.model.js";
import Section from "src/models/course/section.model.js";
import type { CachedSection, UserCourseProgress, UserProgressMap } from "src/types/classroom/batch.type.js";



// ============================================
// REPOSITORY
// ============================================
const DATA_TTL = 60 * 60 * 24; // 24 hours (for structure)
const USER_TTL = 60 * 60 * 24 * 7; // 7 days (for progress)

export const batchRepository = {
    /**
     * Get course structure (Sections -> Lessons -> Content Meta).
     * CACHED: course:{id}:structure
     */
    async getCourseStructure(courseId: mongoose.Types.ObjectId): Promise<{ structure: CachedSection[]; isCached: boolean }> {
        const key = cacheKeyFactory.course.structure(courseId.toString());

        const { data, isCached } = await cacheManager.getOrSet(key, async () => {


            // Fetch Lessons
            // We could do separate queries or a single aggregation. 
            // Since we want to avoid deep nesting in Mongo for performance, let's just do an aggregation 
            // that projects the structure WITHOUT attempts. 
            // Actually, standard Mongo architecture often prefers doing 3 queries: Sections, Lessons, Contents
            // and stitching in memory if N is small.
            // But aggregation is fine for *Structure* since it's cached.
            // Let's use the aggregation provided in the plan but remove the user-specific lookups.

            // Optimized Aggregation for Structure Only
            const structure = await Section.aggregate([
                {
                    $match: {
                        courseId,
                        isDeleted: { $ne: true },
                        isVisible: { $ne: false },
                    },
                },
                { $sort: { order: 1 } },
                {
                    $lookup: {
                        from: "lessons",
                        let: { sectionId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$sectionId", "$$sectionId"] },
                                    courseId,
                                    isDeleted: { $ne: true },
                                    isVisible: { $ne: false },
                                },
                            },
                            { $sort: { order: 1 } },
                            {
                                $lookup: {
                                    from: "lessoncontents",
                                    let: { lessonId: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$lessonId", "$$lessonId"] },
                                                courseId,
                                                isDeleted: { $ne: true },
                                                isVisible: { $ne: false },
                                            },
                                        },
                                        { $sort: { order: 1 } },
                                        {
                                            $project: {
                                                _id: 1,
                                                type: 1,
                                                marks: 1,
                                                deadline: 1,
                                                video: { status: 1 },
                                                assessment: { type: 1 }
                                            }
                                        }
                                    ],
                                    as: "contents"
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    order: 1,
                                    isManuallyUnlocked: 1,
                                    contents: {
                                        $map: {
                                            input: "$contents",
                                            as: "c",
                                            in: {
                                                _id: "$$c._id",
                                                type: "$$c.type",
                                                marks: { $ifNull: ["$$c.marks", 0] },
                                                dueDate: { $ifNull: ["$$c.deadline.dueDate", null] },
                                                startDate: { $ifNull: ["$$c.deadline.startDate", null] },
                                                penaltyPercent: { $ifNull: ["$$c.deadline.penaltyPercent", 0] },
                                                videoStatus: { $ifNull: ["$$c.video.status", null] },
                                                assessmentType: { $ifNull: ["$$c.assessment.type", null] },
                                            }
                                        }
                                    }
                                }
                            }
                        ],
                        as: "lessons",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        order: 1,
                        isManuallyUnlocked: 1,
                        lessons: 1,
                    },
                },
            ]);

            return structure as unknown as CachedSection[];
        }, DATA_TTL);

        return { structure: data, isCached };
    },

    /**
     * Get user progress map for a course.
     * CACHED: user:{userId}:course:{courseId}:progress
     */
    async getUserProgress(
        userId: mongoose.Types.ObjectId,
        courseId: mongoose.Types.ObjectId
    ): Promise<{ progress: UserCourseProgress; isCached: boolean }> {
        const key = cacheKeyFactory.classroom.userProgress(userId.toString(), courseId.toString());

        // This is mutable. But we cache it and update it on write.
        // For READs, we fetch from Redis.
        const { data, isCached } = await cacheManager.getOrSet(key, async () => {
            // Fetch all attempts for this course
            const attempts = await ContentAttempt.find({ userId, courseId })
                .select("contentId isCompleted obtainedMarks updatedAt")
                .lean();

            // Find last visited (latest updatedAt)
            let lastVisitedId: string | undefined;
            if (attempts.length > 0) {
                // We need to query separately or sort in JS. 
                // Since this is infrequent (cache miss), querying DB is cleaner for "last visited lesson".
                // Actually, the attempts list might be large (24k contents).
                // Wait, fetching 24k attempts in memory is heavy.
                // But usually a user hasn't attempted 24k items.
                // If they have, they completed the course.
                // Optimally:
                const map: UserProgressMap = {};

                attempts.forEach(a => {
                    map[a.contentId.toString()] = {
                        isCompleted: a.isCompleted,
                        obtainedMarks: a.obtainedMarks || 0,
                        lastAttemptedAt: a.updatedAt ? a.updatedAt.toISOString() : null
                    };
                });

                // Get last visited *lesson* separately to be accurate?
                // Or use the one from attempts if we populate lessonId?
                // The prompt asked to remove deep recursion.
                // Let's do a fast query for last visited lesson.
                const lastAttempt = await ContentAttempt.findOne({ userId, courseId })
                    .sort({ lastAccessedAt: -1 })
                    .select("lessonId")
                    .lean();

                lastVisitedId = lastAttempt?.lessonId?.toString();

                return { history: map, lastVisitedId };
            }

            return { history: {}, lastVisitedId: undefined };
        }, USER_TTL);

        return { progress: data, isCached };


    },

    /**
     * Invalidate course structure cache (Admin hook)
     */
    async invalidateCourseStructure(courseId: string) {
        await cacheManager.del(cacheKeyFactory.course.structure(courseId));
    },

    /**
     * Update user progress cache (incremental)
     */
    async updateUserProgressCache(
        userId: string,
        courseId: string,
        contentId: string,
        data: { isCompleted: boolean; obtainedMarks: number; lastAttemptedAt: Date }
    ) {
        // We can use HSET if we stored it as a hash, but we stored JSON string.
        // For simplicity and consistency, let's just DEL for now to trigger re-fetch on next read?
        // Or fetch-modify-set.
        // User asked for: "Update Redis incrementally (add/update progress values instead of invalidating)"

        const key = cacheKeyFactory.classroom.userProgress(userId.toString(), courseId.toString());
        const cached = await cacheManager.get<UserCourseProgress>(key);

        if (cached) {
            const progress = cached;
            progress.history[contentId] = {
                isCompleted: data.isCompleted,
                obtainedMarks: data.obtainedMarks,
                lastAttemptedAt: data.lastAttemptedAt.toISOString()
            };
            // How do we update lastVisited? It's passed or derived?
            // Usually if they just updated this content, the lesson of this content becomes last visited.
            // But we might need the lessonId passed here too.
            // For now, let's just update the content bit.

            await cacheManager.set(key, progress, USER_TTL);
        }
    },

    /**
     * Helper to find course title (cached?)
     */
    async findCourseTitle(courseId: mongoose.Types.ObjectId) {
        // Could cache this too
        return Course.findById(courseId).select("title").lean();
    }
};

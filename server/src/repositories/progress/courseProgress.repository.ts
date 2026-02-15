import mongoose from "mongoose";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import CourseProgress from "src/models/course/courseProgress.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import Lesson from "src/models/course/lesson.model.js";
import Section from "src/models/course/section.model.js";
import logger from "src/utils/logger.js";

// ============================================
// COURSE PROGRESS REPOSITORY
// ============================================
// Manages the pre-computed CourseProgress document.
// Reads from Redis cache, writes through to MongoDB + Redis.

export const courseProgressRepository = {
    /**
     * Get pre-computed progress for a user+course
     * Returns null if no document exists (first-time user)
     */
    async getProgress(userId: string, courseId: string) {
        const key = cacheKeyFactory.progress.course(userId, courseId);

        const { data } = await cacheManager.getOrSet(key, async () => {
            return CourseProgress.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                courseId: new mongoose.Types.ObjectId(courseId),
            }).lean();
        }, TTL.USER_TTL);

        return data;
    },

    /**
     * Full recalculation of CourseProgress from ContentAttempt
     * Called by BullMQ worker after content completion
     */
    async recalculate(userId: string, courseId: string): Promise<void> {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        // 1. Get all content items for this course
        const allContents = await LessonContent.find({
            courseId: courseOid,
            isDeleted: { $ne: true },
            isVisible: { $ne: false },
        }).select("_id marks lessonId").lean();

        const totalContents = allContents.length;
        const totalMarks = allContents.reduce((sum, c) => sum + (c.marks || 0), 0);

        // 2. Get user's attempts
        const attempts = await ContentAttempt.find({
            userId: userOid,
            courseId: courseOid,
        }).select("contentId isCompleted obtainedMarks").lean();

        const attemptMap = new Map(
            attempts.map(a => [a.contentId.toString(), a])
        );

        const completedContents = attempts.filter(a => a.isCompleted).length;
        const obtainedMarks = attempts.reduce((sum, a) => sum + (a.obtainedMarks || 0), 0);

        const progressPercent = totalMarks > 0
            ? Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100
            : 0;

        // 3. Calculate unlock state
        const { unlockedLessonIds, unlockedSectionIds } = await this._calculateUnlocks(
            courseOid, allContents, attemptMap
        );

        const isCompleted = completedContents >= totalContents && totalContents > 0;

        // 4. Upsert CourseProgress document
        const progress = await CourseProgress.findOneAndUpdate(
            { userId: userOid, courseId: courseOid },
            {
                $set: {
                    totalContents,
                    completedContents,
                    totalMarks,
                    obtainedMarks,
                    progressPercent,
                    unlockedLessonIds,
                    unlockedSectionIds,
                    isCompleted,
                    lastActivityAt: new Date(),
                },
            },
            { upsert: true, new: true, lean: true }
        );

        // 5. Update Redis cache
        const key = cacheKeyFactory.progress.course(userId, courseId);
        await cacheManager.set(key, progress, TTL.USER_TTL);

        // 6. Also invalidate the old user progress cache (for getBatchDetail compatibility)
        const oldKey = cacheKeyFactory.classroom.userProgress(userId, courseId);
        await cacheManager.del(oldKey);

        logger.debug(`[CourseProgress] Recalculated for user=${userId} course=${courseId}: ${completedContents}/${totalContents} (${progressPercent}%)`);
    },

    /**
     * Calculate which lessons and sections are unlocked
     * Based on sequential completion logic
     */
    async _calculateUnlocks(
        courseId: mongoose.Types.ObjectId,
        allContents: any[],
        attemptMap: Map<string, any>
    ): Promise<{ unlockedLessonIds: mongoose.Types.ObjectId[]; unlockedSectionIds: mongoose.Types.ObjectId[] }> {
        const unlockedLessonIds: mongoose.Types.ObjectId[] = [];
        const unlockedSectionIds: mongoose.Types.ObjectId[] = [];

        // Fetch structure
        const sections = await Section.find({
            courseId,
            isDeleted: { $ne: true },
            isVisible: { $ne: false },
        }).sort({ order: 1 }).select("_id isManuallyUnlocked").lean();

        let prevSectionCompleted = true;

        for (let si = 0; si < sections.length; si++) {
            const section = sections[si];
            const isFirstSection = si === 0;
            const sectionManuallyUnlocked = (section as any).isManuallyUnlocked === true;

            const sectionIsUnlocked = isFirstSection || sectionManuallyUnlocked || prevSectionCompleted;

            if (sectionIsUnlocked) {
                unlockedSectionIds.push(section._id as mongoose.Types.ObjectId);
            }

            // Get lessons for this section
            const lessons = await Lesson.find({
                courseId,
                sectionId: section._id,
                isDeleted: { $ne: true },
                isVisible: { $ne: false },
            }).sort({ order: 1 }).select("_id isManuallyUnlocked").lean();

            let prevLessonCompleted = true;
            let allSectionLessonsCompleted = true;

            for (let li = 0; li < lessons.length; li++) {
                const lesson = lessons[li];
                const isFirstLesson = li === 0;
                const lessonManuallyUnlocked = (lesson as any).isManuallyUnlocked === true;

                const lessonIsUnlocked = sectionIsUnlocked && (isFirstLesson || lessonManuallyUnlocked || prevLessonCompleted);

                if (lessonIsUnlocked) {
                    unlockedLessonIds.push(lesson._id as mongoose.Types.ObjectId);
                }

                // Check if all contents in this lesson are completed
                const lessonContents = allContents.filter(
                    c => c.lessonId.toString() === lesson._id.toString()
                );

                const lessonIsComplete = lessonContents.length > 0 && lessonContents.every(
                    c => attemptMap.get(c._id.toString())?.isCompleted
                );

                prevLessonCompleted = lessonIsComplete;
                if (!lessonIsComplete) allSectionLessonsCompleted = false;
            }

            prevSectionCompleted = allSectionLessonsCompleted && lessons.length > 0;
        }

        return { unlockedLessonIds, unlockedSectionIds };
    },

    /**
     * Invalidate cached progress
     */
    async invalidate(userId: string, courseId: string): Promise<void> {
        const key = cacheKeyFactory.progress.course(userId, courseId);
        await cacheManager.del(key);
    },
};

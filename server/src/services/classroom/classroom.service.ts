import mongoose from "mongoose";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import logger from "src/utils/logger.js";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import { TTL } from "src/cache/cacheTTL.js";
import { batchRepository } from "../../repositories/classroom/batch.repository.js";
import computeLessonMeta from "src/utils/computeLessonMeta.js";
import type { AggContent } from "src/types/classroom/batch.type.js";

// ============================================
// INTERFACES
// ============================================
interface ClassroomCourse {
    id: string;
    title: string;
    date: string;
    progress: number;
    image: string;
    links: { type: string; url: string; isPublic: boolean }[];
    enrolledAt: string;
}

// ============================================
// CLASSROOM SERVICE
// ============================================
export const classroomService = {

    /**
     * Calculate progress for a single course using the same logic as batch service.
     * This accounts for penalties/deadlines — unlike CourseProgress.progressPercent
     * which stores raw (pre-penalty) marks.
     */
    calculateCourseProgress: async (userId: string, courseId: string): Promise<number> => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        const [structureResult, progressResult] = await Promise.all([
            batchRepository.getCourseStructure(courseOid),
            batchRepository.getUserProgress(userOid, courseOid),
        ]);

        const { structure } = structureResult;
        const { progress: userProgress } = progressResult;
        const { history } = userProgress;
        const now = new Date();

        let totalScore = 0;
        let obtainedScore = 0;

        const sectionCompletionMap: boolean[] = [];

        for (let sectionIndex = 0; sectionIndex < structure.length; sectionIndex++) {
            const section = structure[sectionIndex];
            const isFirstSection = sectionIndex === 0;
            const isManuallyUnlocked = section.isManuallyUnlocked === true;
            const prevSectionCompleted = sectionIndex > 0 ? sectionCompletionMap[sectionIndex - 1] : true;

            const sectionIsLocked =
                !isFirstSection &&
                !isManuallyUnlocked &&
                !prevSectionCompleted;

            let allItemsCompleted = true;
            let sectionHasItems = false;
            let prevLessonCompleted = true;

            for (let i = 0; i < section.lessons.length; i++) {
                const lesson = section.lessons[i];
                const isFirstLesson = i === 0;
                const lessonManuallyUnlocked = lesson.isManuallyUnlocked === true;

                const lessonIsLocked =
                    sectionIsLocked ||
                    (!isFirstLesson && !lessonManuallyUnlocked && !prevLessonCompleted);

                let lessonAllCompleted = true;

                const hydratedContents: AggContent[] = lesson.contents.map((c: any) => {
                    sectionHasItems = true;
                    const prog = history[c._id.toString()];
                    const marks = c.marks || 0;
                    totalScore += marks;

                    const isCompleted = prog?.isCompleted || false;
                    const obtained = prog?.obtainedMarks || 0;

                    if (!isCompleted) {
                        lessonAllCompleted = false;
                        allItemsCompleted = false;
                    }

                    return {
                        _id: new mongoose.Types.ObjectId(c._id),
                        type: c.type,
                        marks,
                        isCompleted,
                        obtainedMarks: obtained,
                        lastAttemptedAt: prog?.lastAttemptedAt
                            ? new Date(prog.lastAttemptedAt)
                            : null,
                    };
                });

                const lessonCompleted = lessonAllCompleted && lesson.contents.length > 0;
                prevLessonCompleted = lessonCompleted;

                const meta = computeLessonMeta(
                    hydratedContents,
                    now,
                    lessonIsLocked,
                    lesson.deadline
                        ? {
                            dueDate: lesson.deadline.dueDate
                                ? new Date(lesson.deadline.dueDate)
                                : null,
                            startDate: lesson.deadline.startDate
                                ? new Date(lesson.deadline.startDate)
                                : null,
                            penaltyPercent: lesson.deadline.penaltyPercent,
                        }
                        : undefined
                );

                obtainedScore += meta.obtainedMarks;
            }

            const sectionCompleted = allItemsCompleted && sectionHasItems;
            sectionCompletionMap.push(sectionCompleted);
        }

        return totalScore > 0
            ? Math.round((obtainedScore / totalScore) * 10000) / 100
            : 0;
    },

    /**
     * Get all classroom data for a student
     */
    getClassroomData: async (userId: string): Promise<{ courses: ClassroomCourse[] }> => {

        const cacheKey = cacheKeyFactory.classroom.data(userId);

        const { data } = await cacheManager.getOrSet(
            cacheKey,
            async () => {

                const enrollments = await Enrollment.find({
                    userId: new mongoose.Types.ObjectId(userId),
                    status: EnrollmentStatus.ACTIVE,
                })
                    .sort({ enrolledAt: -1, createdAt: -1 })
                    .populate({
                        path: "courseId",
                        select: "title thumbnail coverImage batch socialLinks slug",
                    })
                    .lean();

                if (!enrollments.length) {
                    return { courses: [] };
                }

                const coursesWithProgress: ClassroomCourse[] = [];

                for (const enrollment of enrollments) {

                    if (!enrollment.courseId || typeof enrollment.courseId !== "object")
                        continue;

                    const course = enrollment.courseId as any;
                    const courseId = course._id.toString();

                    // Use the same calculation as batch service (with penalties)
                    const progress = await classroomService.calculateCourseProgress(userId, courseId);

                    const publicLinks = (course.socialLinks || [])
                        .filter((link: any) => link.isPublic);

                    coursesWithProgress.push({
                        id: courseId,
                        title: course.title || "Untitled Course",
                        date:
                            course.batch?.startDate?.toISOString?.()
                            || enrollment.enrolledAt?.toISOString?.()
                            || enrollment.createdAt?.toISOString?.()
                            || new Date().toISOString(),
                        progress: Math.min(progress, 100),
                        image: course.thumbnail || course.coverImage || "",
                        links: publicLinks.map((link: any) => ({
                            type: link.type,
                            url: link.url,
                            isPublic: link.isPublic,
                        })),
                        enrolledAt:
                            enrollment.enrolledAt?.toISOString?.()
                            || enrollment.createdAt?.toISOString?.()
                            || new Date().toISOString(),
                    });
                }

                return { courses: coursesWithProgress };
            },
            TTL.USER_TTL
        );

        logger.info("Classroom data retrieved", {
            userId,
            courseCount: data?.courses?.length,
        });

        return data;
    },

    /**
     * Invalidate classroom data cache for a specific user
     */
    invalidateClassroomCache: async (userId: string) => {
        const key = cacheKeyFactory.classroom.data(userId);
        await cacheManager.del(key);
    },

    /**
     * Get student activity heatmap data
     */
    getStudentActivity: async (
        userId: string
    ): Promise<{ date: string; count: number }[]> => {

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const activity = await ContentAttempt.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    updatedAt: { $gte: oneYearAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$updatedAt",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: "$count",
                },
            },
            { $sort: { date: 1 } },
        ]);

        return activity;
    },
};

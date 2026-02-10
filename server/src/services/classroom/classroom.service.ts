import mongoose from "mongoose";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import logger from "src/utils/logger.js";

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
     * Get all classroom data for a student:
     * - Enrolled courses with populated details
     * - Progress percentage for each course
     */
    getClassroomData: async (userId: string): Promise<{ courses: ClassroomCourse[] }> => {
        // 1. Get all active enrollments with course details
        const enrollments = await Enrollment.find({
            userId: new mongoose.Types.ObjectId(userId),
            status: EnrollmentStatus.ACTIVE,
        })
            .sort({ enrolledAt: -1, createdAt: -1 })
            .populate({
                path: "courseId",
                select: "title thumbnail coverImage batch socialLinks",
            })
            .lean();

        if (!enrollments.length) {
            return { courses: [] };
        }

        // 2. Get course IDs
        const courseIds = enrollments
            .map((e) => (e.courseId as any)?._id)
            .filter(Boolean);

        // 3. Aggregate progress for all courses in one query
        //    Count total content items per course
        const [totalContentCounts, completedCounts] = await Promise.all([
            LessonContent.aggregate([
                {
                    $match: {
                        courseId: { $in: courseIds },
                        isDeleted: { $ne: true },
                        isVisible: { $ne: false },
                    },
                },
                { $group: { _id: "$courseId", total: { $sum: 1 } } },
            ]),
            ContentAttempt.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        courseId: { $in: courseIds },
                        isCompleted: true,
                    },
                },
                { $group: { _id: "$courseId", completed: { $sum: 1 } } },
            ]),
        ]);

        // Build lookup maps
        const totalMap = new Map<string, number>();
        for (const item of totalContentCounts) {
            totalMap.set(item._id.toString(), item.total);
        }

        const completedMap = new Map<string, number>();
        for (const item of completedCounts) {
            completedMap.set(item._id.toString(), item.completed);
        }

        // 4. Build the response
        const courses: ClassroomCourse[] = enrollments
            .filter((e) => e.courseId && typeof e.courseId === "object")
            .map((enrollment) => {
                const course = enrollment.courseId as any;
                const courseId = course._id.toString();

                const total = totalMap.get(courseId) || 0;
                const completed = completedMap.get(courseId) || 0;
                const progress = total > 0
                    ? Math.round((completed / total) * 100 * 10) / 10
                    : 0;

                // Filter social links to only public ones
                const publicLinks = (course.socialLinks || [])
                    .filter((link: any) => link.isPublic);

                return {
                    id: courseId,
                    title: course.title || "Untitled Course",
                    date: course.batch?.startDate
                        || enrollment.enrolledAt?.toISOString?.()
                        || enrollment.createdAt?.toISOString?.()
                        || new Date().toISOString(),
                    progress,
                    image: course.thumbnail || course.coverImage || "",
                    links: publicLinks.map((link: any) => ({
                        type: link.type,
                        url: link.url,
                        isPublic: link.isPublic,
                    })),
                    enrolledAt: enrollment.enrolledAt?.toISOString?.()
                        || enrollment.createdAt?.toISOString?.()
                        || new Date().toISOString(),
                };
            });

        logger.info("Classroom data retrieved", {
            userId,
            courseCount: courses.length,
        });

        return { courses };
    },
};

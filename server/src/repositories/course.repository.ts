import mongoose, { Types } from "mongoose";
import type { FilterQuery, UpdateQuery } from "mongoose";
import Course from "src/models/course/course.model.js";
import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";

// ============================================
// COURSE REPOSITORY
// ============================================
export const courseRepository = {

    // Find all published courses
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
        const filter: FilterQuery<any> = { isPublished: true };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (category) filter.category = category;
        if (subCategory) filter.subCategory = subCategory;
        const [courses, total] = await Promise.all([
            Course.find(filter)
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("instructor", "name avatar")
                .populate("category", "name slug")
                .populate("subCategory", "name slug")
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

    // Find published course by ID or Slug
    findPublishedById: async (idOrSlug: string | Types.ObjectId) => {
        // Check if it's a valid ObjectId, if not, treat as slug
        const isObjectId = Types.ObjectId.isValid(idOrSlug) &&
            (typeof idOrSlug === 'string' ? idOrSlug.length === 24 : true);

        const query = isObjectId
            ? { _id: idOrSlug, isPublished: true }
            : { slug: idOrSlug, isPublished: true };

        return Course.findOne(query)
            .populate("instructor", "name email avatar fullName profileImage")
            .populate("category", "name slug")
            .populate("subCategory", "name slug");
    },



    // Create
    create: async (data: any) => {
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

        const filter: FilterQuery<any> = { instructor: instructorId };

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
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID
    deleteById: async (id: string | Types.ObjectId) => {
        return Course.findByIdAndDelete(id);
    },

    // Check if slug exists
    slugExists: async (slug: string, excludeId?: string | Types.ObjectId) => {
        const filter: FilterQuery<any> = { slug };
        if (excludeId) filter._id = { $ne: excludeId };
        return Course.exists(filter);
    },

    // Publish/Unpublish course
    updatePublishStatus: async (id: string | Types.ObjectId, isPublished: boolean) => {
        const updateData: any = { isPublished };
        if (isPublished) {
            updateData.publishedAt = new Date();
            updateData.status = "published";
        } else {
            updateData.status = "draft";
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
};

// ============================================
// SECTION REPOSITORY
// ============================================
export const sectionRepository = {
    // Create
    create: async (data: any) => {
        return Section.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return Section.findById(id);
    },

    // Find all sections by course
    findByCourse: async (courseId: string | Types.ObjectId) => {
        return Section.find({ courseId })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in course
    getMaxOrder: async (courseId: string | Types.ObjectId) => {
        const lastSection = await Section.findOne({ courseId })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastSection?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID
    deleteById: async (id: string | Types.ObjectId) => {
        return Section.findByIdAndDelete(id);
    },

    // Bulk reorder sections
    bulkReorder: async (sections: { id: string; order: number }[]) => {
        const bulkOps = sections.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id) },
                update: { $set: { order } },
            },
        }));
        return Section.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const section = await Section.findById(id);
        if (!section) return null;
        section.isVisible = !section.isVisible;
        return section.save();
    },

    // Delete all sections by course
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return Section.deleteMany({ courseId });
    },
};

// ============================================
// LESSON REPOSITORY
// ============================================
export const lessonRepository = {
    // Create
    create: async (data: any) => {
        return Lesson.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return Lesson.findById(id);
    },

    // Find all lessons by section
    findBySection: async (sectionId: string | Types.ObjectId) => {
        return Lesson.find({ sectionId })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in section
    getMaxOrder: async (sectionId: string | Types.ObjectId) => {
        const lastLesson = await Lesson.findOne({ sectionId })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastLesson?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID
    deleteById: async (id: string | Types.ObjectId) => {
        return Lesson.findByIdAndDelete(id);
    },

    // Bulk reorder lessons
    bulkReorder: async (lessons: { id: string; order: number }[]) => {
        const bulkOps = lessons.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id) },
                update: { $set: { order } },
            },
        }));
        return Lesson.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const lesson = await Lesson.findById(id);
        if (!lesson) return null;
        lesson.isVisible = !lesson.isVisible;
        return lesson.save();
    },

    // Delete all lessons by section
    deleteBySection: async (sectionId: string | Types.ObjectId) => {
        return Lesson.deleteMany({ sectionId });
    },

    // Delete all lessons by course
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return Lesson.deleteMany({ courseId });
    },
};

// ============================================
// LESSON CONTENT REPOSITORY
// ============================================
export const lessonContentRepository = {
    // Create
    create: async (data: any) => {
        return LessonContent.create(data);
    },

    // Find by ID
    findById: async (id: string | Types.ObjectId) => {
        return LessonContent.findById(id);
    },

    // Find all contents by lesson
    findByLesson: async (lessonId: string | Types.ObjectId) => {
        return LessonContent.find({ lessonId })
            .sort({ order: 1 })
            .lean();
    },

    // Get max order in lesson
    getMaxOrder: async (lessonId: string | Types.ObjectId) => {
        const lastContent = await LessonContent.findOne({ lessonId })
            .sort({ order: -1 })
            .select("order")
            .lean();
        return lastContent?.order ?? 0;
    },

    // Update by ID
    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return LessonContent.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete by ID
    deleteById: async (id: string | Types.ObjectId) => {
        return LessonContent.findByIdAndDelete(id);
    },

    // Bulk reorder contents
    bulkReorder: async (contents: { id: string; order: number }[]) => {
        const bulkOps = contents.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(id) },
                update: { $set: { order } },
            },
        }));
        return LessonContent.bulkWrite(bulkOps);
    },

    // Toggle visibility
    toggleVisibility: async (id: string | Types.ObjectId) => {
        const content = await LessonContent.findById(id);
        if (!content) return null;
        content.isVisible = !content.isVisible;
        return content.save();
    },

    // Delete all contents by lesson
    deleteByLesson: async (lessonId: string | Types.ObjectId) => {
        return LessonContent.deleteMany({ lessonId });
    },

    // Delete all contents by course
    deleteByCourse: async (courseId: string | Types.ObjectId) => {
        return LessonContent.deleteMany({ courseId });
    },
};

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

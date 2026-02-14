import mongoose from "mongoose";
import AppError from "src/utils/AppError.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { env } from "src/configs/env.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { type AggContent } from "src/types/classroom/batch.type.js";
import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import computeLessonMeta from "src/utils/computeLessonMeta.js";
import type { BatchData, BatchDetailResponse, ContentDetailResponse, LessonResult, Module } from "src/types/classroom/batch.type.js";



// ============================================
// BATCH SERVICE
// ============================================
export const batchService = {
    /**
     * Get batch detail data for a student.
     * Uses independent cached calls for Structure and Progress, merging them in-memory.
     */
    getBatchDetail: async (userId: string, courseId: string): Promise<BatchDetailResponse> => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        // Parallel fetch from Redis/DB via Repository
        const [courseTitle, structureResult, progressResult] = await Promise.all([
            batchRepository.findCourseTitle(courseOid),
            batchRepository.getCourseStructure(courseOid),
            batchRepository.getUserProgress(userOid, courseOid),
        ]);

        const { structure, isCached: isStructureCached } = structureResult;
        const { progress: userProgress, isCached: isProgressCached } = progressResult;

        if (!courseTitle) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // ========================================
        // IN-MEMORY MERGE & LOCKING LOGIC
        // ========================================
        const now = new Date();
        const { history, lastVisitedId } = userProgress;

        let completedSections = 0;
        let completedLessons = 0;
        let totalLessons = 0;
        let totalScore = 0;
        let obtainedScore = 0;

        const sectionCompletionMap: boolean[] = [];

        // Map cached structure to response format
        const modules: Module[] = structure.map((section, sectionIndex) => {
            const isFirstSection = sectionIndex === 0;
            const isManuallyUnlocked = section.isManuallyUnlocked === true;
            const prevSectionCompleted = sectionIndex > 0 ? sectionCompletionMap[sectionIndex - 1] : true;
            // Auto-lock logic: if not first, not manually unlocked, and previous not done => LOCKED
            const sectionIsLocked = !isFirstSection && !isManuallyUnlocked && !prevSectionCompleted;

            const lessonResults: LessonResult[] = [];
            let allItemsCompleted = true;
            let sectionHasItems = false;
            let prevLessonCompleted = true; // First lesson in section is unlocked by default (if section unlocked)

            for (let i = 0; i < section.lessons.length; i++) {
                const lesson = section.lessons[i];
                totalLessons++;

                const isFirstLesson = i === 0;
                const lessonManuallyUnlocked = lesson.isManuallyUnlocked === true;
                // Lesson lock logic
                const lessonIsLocked = sectionIsLocked || (!isFirstLesson && !lessonManuallyUnlocked && !prevLessonCompleted);

                // Check content progress
                let lessonAllCompleted = true;

                // We need to map contents to AggContent format for computeLessonMeta
                // But computeLessonMeta needs obtainedMarks etc. to be populated.
                const hydratedContents: AggContent[] = lesson.contents.map(c => {
                    sectionHasItems = true;
                    const progress = history[c._id.toString()];

                    const marks = c.marks || 0;
                    totalScore += marks;

                    const isCompleted = progress?.isCompleted || false;
                    const obtained = progress?.obtainedMarks || 0;
                    const lastAttemptedAt = progress?.lastAttemptedAt ? new Date(progress.lastAttemptedAt) : null;

                    if (isCompleted) {
                        obtainedScore += obtained;
                    } else {
                        lessonAllCompleted = false;
                        allItemsCompleted = false;
                    }

                    return {
                        _id: new mongoose.Types.ObjectId(c._id),
                        type: c.type,
                        marks,
                        isCompleted,
                        obtainedMarks: obtained,
                        lastAttemptedAt: lastAttemptedAt,
                        // We removed these from the query so don't map them
                        // videoStatus: c.videoStatus,
                        // assessmentType: c.assessmentType,
                    };
                });

                const lessonCompleted = lessonAllCompleted && lesson.contents.length > 0;
                if (lessonCompleted) completedLessons++;

                // Next lesson depends on this one
                prevLessonCompleted = lessonCompleted;

                // Compute Aggregated Meta (Overdue, Deadline, etc.)
                const meta = computeLessonMeta(
                    hydratedContents,
                    now,
                    lessonIsLocked,
                    lesson.deadline ? {
                        dueDate: lesson.deadline.dueDate ? new Date(lesson.deadline.dueDate) : null, // Convert string to Date
                        startDate: lesson.deadline.startDate ? new Date(lesson.deadline.startDate) : null, // Convert string to Date
                        penaltyPercent: lesson.deadline.penaltyPercent
                    } : undefined
                );

                lessonResults.push({
                    id: lesson._id.toString(),
                    title: lesson.title,
                    completed: lessonCompleted,
                    isLocked: lessonIsLocked,
                    ...meta,
                });
            }

            const sectionCompleted = allItemsCompleted && sectionHasItems;
            sectionCompletionMap.push(sectionCompleted);
            if (sectionCompleted) completedSections++;

            return {
                id: section._id.toString(),
                title: section.title,
                completed: sectionCompleted,
                isLocked: sectionIsLocked,
                lessons: lessonResults,
            };
        });

        const progressPercent = totalScore > 0
            ? Math.round((obtainedScore / totalScore) * 100 * 100) / 100
            : 0;

        const batchData: BatchData = {
            title: courseTitle.title,
            progress: progressPercent,
            modules: completedSections,
            totalModules: structure.length,
            subModules: completedLessons,
            totalSubModules: totalLessons,
            score: obtainedScore,
            totalScore,
        };

        return {
            batchData,
            modules,
            lastVisitedId,
            meta: {
                isStructureCached,
                isProgressCached
            }
        };
    },

    /**
     * Get content detail for a specific lesson content
     */
    getContentDetail: async (
        userId: string,
        courseId: string,
        contentId: string,
    ): Promise<ContentDetailResponse> => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        // Fetch content
        const content = await LessonContent.findOne({
            _id: new mongoose.Types.ObjectId(contentId),
            courseId: courseOid,
            isDeleted: { $ne: true },
            isVisible: { $ne: false },
        })
            .populate({
                path: "assessment.refId",
            })
            .lean();

        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const contentObj = content as any;
        if (contentObj.assessment && contentObj.assessment.refId) {
            contentObj.assessment.data = contentObj.assessment.refId;
            delete contentObj.assessment.refId;
        }

        const now = new Date();

        // Check if locked by startDate (Removed as per new logic)
        /*
        if (content.deadline?.startDate && new Date(content.deadline.startDate) > now) {
            throw new AppError("This content is not yet available", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }
        */

        // Check if video is not ready
        if ((content.type as string) === "video" && content.video?.status && content.video.status !== "READY") {
            throw new AppError(`Video is ${content.video.status.toLowerCase()}. Please try again later.`, STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }

        // === SEQUENTIAL LOCK CHECK ===
        const lesson = await Lesson.findById(content.lessonId).lean();
        const section = lesson ? await Section.findById(lesson.sectionId).lean() : null;

        if (section && lesson) {
            // Check section lock
            const allSectionsForCourse = await Section.find({
                courseId: courseOid, isDeleted: { $ne: true }, isVisible: { $ne: false },
            }).sort({ order: 1 }).lean();

            const sectionIndex = allSectionsForCourse.findIndex(
                (s) => s._id.toString() === section._id.toString()
            );

            if (sectionIndex > 0 && !(section as any).isManuallyUnlocked) {
                const prevSection = allSectionsForCourse[sectionIndex - 1];
                const prevLessons = await Lesson.find({
                    courseId: courseOid, sectionId: prevSection._id, isDeleted: { $ne: true },
                }).lean();
                const prevContents = await LessonContent.find({
                    courseId: courseOid, lessonId: { $in: prevLessons.map((l) => l._id) }, isDeleted: { $ne: true },
                }).lean();

                const prevAttempts = await ContentAttempt.find({
                    userId: userOid, contentId: { $in: prevContents.map((c) => c._id) },
                }).lean();

                const prevAttemptMap = new Map(prevAttempts.map((a) => [a.contentId.toString(), a]));
                const allPrevCompleted = prevContents.every((c) => prevAttemptMap.get(c._id.toString())?.isCompleted);

                if (!allPrevCompleted && prevContents.length > 0) {
                    throw new AppError("Complete the previous section first", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
                }
            }

            // Check lesson lock within section
            const allLessonsForSection = await Lesson.find({
                courseId: courseOid, sectionId: section._id, isDeleted: { $ne: true }, isVisible: { $ne: false },
            }).sort({ order: 1 }).lean();

            const lessonIndex = allLessonsForSection.findIndex(
                (l) => l._id.toString() === lesson._id.toString()
            );

            if (lessonIndex > 0 && !(lesson as any).isManuallyUnlocked) {
                const prevLesson = allLessonsForSection[lessonIndex - 1];
                const prevLessonContents = await LessonContent.find({
                    courseId: courseOid, lessonId: prevLesson._id, isDeleted: { $ne: true },
                }).lean();

                const prevLessonAttempts = await ContentAttempt.find({
                    userId: userOid, contentId: { $in: prevLessonContents.map((c) => c._id) },
                }).lean();

                const prevLessonAttemptMap = new Map(prevLessonAttempts.map((a) => [a.contentId.toString(), a]));
                const allPrevLessonCompleted = prevLessonContents.every(
                    (c) => prevLessonAttemptMap.get(c._id.toString())?.isCompleted
                );

                if (!allPrevLessonCompleted && prevLessonContents.length > 0) {
                    throw new AppError("Complete the previous lesson first", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
                }
            }
        }

        // Fetch user's attempt
        let attempt = await ContentAttempt.findOne({ userId: userOid, contentId: content._id });

        // Update last accessed time
        if (attempt) {
            attempt.lastAccessedAt = new Date();
            await attempt.save();
        } else {
            attempt = await ContentAttempt.create({
                userId: userOid,
                courseId: courseOid,
                lessonId: content.lessonId,
                contentId: content._id,
                lastAccessedAt: new Date(),
                totalMarks: content.marks || 0
            });
        }

        const attemptObj = attempt.toObject();

        const cdnBase = env.CDN_BASE_URL || "";
        const ctype = content.type as string;

        const response: ContentDetailResponse = {
            id: content._id.toString(),
            title: content.title,
            contentType: content.type,
            marks: content.marks || 0,
            isCompleted: attemptObj?.isCompleted || false,
            resumeAt: attemptObj?.resumeAt || 0,
            totalDuration: attemptObj?.totalDuration || 0,
            obtainedMarks: attemptObj?.obtainedMarks || 0,
        };

        if (ctype === "video" && content.video) {
            if (content.video.hlsKey) {
                response.videoUrl = `${cdnBase}/${content.video.hlsKey}`;
            }
            response.videoStatus = content.video.status;
            response.videoDuration = content.video.duration;
            response.minWatchPercent = content.video.minWatchPercent;
        }

        if (ctype === "pdf" && content.pdf) {
            response.pdfUrl = content.pdf.url;
            response.totalPages = content.pdf.totalPages;
        }

        if (ctype === "audio" && content.audio) {
            response.audioUrl = content.audio.url;
            response.audioDuration = content.audio.duration;
        }

        if ((ctype === "assignment" || ctype === "quiz") && content.assessment) {
            response.assessment = {
                type: content.assessment.type,
                data: content.assessment.refId,
            };
        }

        return response;
    },

    /**
     * Get details for a specific lesson (Lazy Loading)
     * Returns: Lesson title, order, and list of contents with user progress.
     */
    getLessonDetails: async (
        userId: string,
        courseId: string,
        lessonId: string
    ) => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);
        const lessonOid = new mongoose.Types.ObjectId(lessonId);

        // 1. Fetch Lesson & Contents
        const lesson = await Lesson.findOne({
            _id: lessonOid,
            courseId: courseOid,
            isDeleted: { $ne: true },
            isVisible: { $ne: false }
        }).select("title order sectionId").lean();

        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const contents = await LessonContent.find({
            lessonId: lessonOid,
            courseId: courseOid,
            isDeleted: { $ne: true },
            isVisible: { $ne: false }
        })
            .sort({ order: 1 })
            .select("title type marks video.status video.duration pdf.totalPages audio.duration assessment.type")
            .lean();

        // 2. Fetch User Progress for these contents
        const { progress: userProgress, isCached: isProgressCached } = await batchRepository.getUserProgress(userOid, courseOid);
        const { history } = userProgress;

        // 3. Map contents with progress
        const contentDetails = contents.map(c => {
            const progress = history[c._id.toString()];
            const isCompleted = progress?.isCompleted || false;
            const obtainedMarks = progress?.obtainedMarks || 0;

            return {
                id: c._id.toString(),
                title: c.title,
                type: c.type,
                marks: c.marks || 0,
                isCompleted,
                obtainedMarks,
                // Add other lightweight meta needed for list view
                videoStatus: c.video?.status,
                videoDuration: c.video?.duration,
                totalPages: c.pdf?.totalPages,
                audioDuration: c.audio?.duration,
                assessmentType: c.assessment?.type
            };
        });

        return {
            id: lesson._id.toString(),
            title: lesson.title, contents: contentDetails,
            meta: {
                isProgressCached
            }
        };
    }
};

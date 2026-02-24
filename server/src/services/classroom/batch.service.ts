import mongoose from "mongoose";
import { env } from "src/configs/env.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";
import type { BatchData, BatchDetailResponse, ContentDetailResponse, LessonResult, Module } from "src/types/classroom/batch.type.js";
import { type AggContent, type LeaderboardResponse } from "src/types/classroom/batch.type.js";
import AppError from "src/utils/AppError.js";
import computeLessonMeta from "src/utils/computeLessonMeta.js";
import logger from "src/utils/logger.js";



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

        const now = new Date();
        const { history, lastVisitedId, lastVisitedLessonId } = userProgress;

        let completedSections = 0;
        let completedLessons = 0;
        let totalLessons = 0;
        let totalScore = 0;
        let obtainedScore = 0;

        const sectionCompletionMap: boolean[] = [];

        const modules: Module[] = structure.map((section, sectionIndex) => {

            const isFirstSection = sectionIndex === 0;
            const isManuallyUnlocked = section.isManuallyUnlocked === true;
            const prevSectionCompleted = sectionIndex > 0 ? sectionCompletionMap[sectionIndex - 1] : true;

            const sectionIsLocked =
                !isFirstSection &&
                !isManuallyUnlocked &&
                !prevSectionCompleted;

            const lessonResults: LessonResult[] = [];
            let allItemsCompleted = true;
            let sectionHasItems = false;
            let prevLessonCompleted = true;

            for (let i = 0; i < section.lessons.length; i++) {

                const lesson = section.lessons[i];
                totalLessons++;

                const isFirstLesson = i === 0;
                const lessonManuallyUnlocked = lesson.isManuallyUnlocked === true;

                const lessonIsLocked =
                    sectionIsLocked ||
                    (!isFirstLesson && !lessonManuallyUnlocked && !prevLessonCompleted);

                let lessonAllCompleted = true;

                const hydratedContents: AggContent[] = lesson.contents.map(c => {

                    sectionHasItems = true;

                    const progress = history[c._id.toString()];
                    const marks = c.marks || 0;

                    totalScore += marks;

                    const isCompleted = progress?.isCompleted || false;
                    const obtained = progress?.obtainedMarks || 0;

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
                        lastAttemptedAt: progress?.lastAttemptedAt
                            ? new Date(progress.lastAttemptedAt)
                            : null,
                    };
                });

                const lessonCompleted =
                    lessonAllCompleted && lesson.contents.length > 0;

                if (lessonCompleted) completedLessons++;

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

                // 🔥 IMPORTANT: add penalized marks
                obtainedScore += meta.obtainedMarks;

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

        const progressPercent =
            totalScore > 0
                ? Math.round((obtainedScore / totalScore) * 10000) / 100
                : 0;

        const batchData: BatchData = {
            courseId: courseId,
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
            lastVisitedLessonId,
            meta: {
                isStructureCached,
                isProgressCached,
            },
        };
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
            .select("title type marks video.status video.duration pdf.totalPages audio.duration assessment.type assessment.refId")
            .populate("assessment.refId")
            .lean();

        // 2. Fetch User Progress for these contents
        const { progress: userProgress, isCached: isProgressCached } = await batchRepository.getUserProgress(userOid, courseOid);
        const { history } = userProgress;

        // 3. Map contents with progress
        const contentDetails = contents.map(c => {
            const progress = history[c._id.toString()];
            const isCompleted = progress?.isCompleted || false;
            const obtainedMarks = progress?.obtainedMarks || 0;

            const baseContent: any = {
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

            // If assessment data is populated, include it
            if (c.assessment?.refId) {
                baseContent.assessment = {
                    type: c.assessment.type,
                    data: c.assessment.refId
                };
            }

            return baseContent;
        });

        // 4. Determine lastVisitedId for this lesson
        // Check if the user's global lastVisitedId (if any) is within THIS lesson's contents
        // This helps the UI auto-select the correct content if coming from "Continue Learning"
        let lastVisitedIdInLesson: string | undefined;

        if (userProgress.lastVisitedId) {
            const isLastVisitedInLesson = contents.some(c => c._id.toString() === userProgress.lastVisitedId);
            if (isLastVisitedInLesson) {
                lastVisitedIdInLesson = userProgress.lastVisitedId;
            }
        }

        return {
            id: lesson._id.toString(),
            title: lesson.title,
            contents: contentDetails,
            lastVisitedId: lastVisitedIdInLesson,
            meta: {
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

        // === OPTIMIZED SEQUENTIAL LOCK CHECK ===
        // Instead of 5+ DB queries, use pre-computed CourseProgress
        const courseProgress = await courseProgressRepository.getProgress(userId, courseId);

        if (courseProgress) {
            const lessonId = content.lessonId.toString();
            const unlockedLessons = (courseProgress.unlockedLessonIds || []).map((id: any) => id.toString());

            // If we have unlock data and this lesson is not in the unlocked list
            if (unlockedLessons.length > 0 && !unlockedLessons.includes(lessonId)) {
                // Check if this lesson needs a manual unlock check
                const lesson = await Lesson.findById(content.lessonId).select("isManuallyUnlocked").lean();
                if (!(lesson as any)?.isManuallyUnlocked) {
                    throw new AppError("Complete the previous lesson first", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
                }
            }
        }
        // If no CourseProgress exists yet (first-time user / pre-migration),
        // fall through and allow access — the old behavior.

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
            tags: content.tags,
            description: content.description,
            level: content.level,
            relatedLinks: content.relatedLinks?.map((l: any) => ({
                title: l.title || "",
                url: l.url || ""
            })) || [],
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

        if ((ctype === "assignment" || ctype === "quiz") && contentObj.assessment?.data) {
            let assessmentData = contentObj.assessment.data;

            // SECURITY: Hide correct answers and explanations for quizzes if not completed
            if (ctype === "quiz" && assessmentData.questions) {
                const showAnswers = attemptObj?.isCompleted && assessmentData.showCorrectAnswers;

                assessmentData.questions = assessmentData.questions.map((q: any) => {
                    return {
                        ...q,
                        // hide correct answer if not allowed to show
                        correctAnswerIndex: showAnswers ? q.correctAnswerIndex : -1,
                        // hide explanation if not allowed to show
                        explanation: showAnswers ? q.explanation : undefined
                    };
                });
            }

            response.assessment = {
                type: contentObj.assessment.type,
                data: assessmentData, // Populated and secured data
            };
        }

        return response;
    },

    /**
     * Get leaderboard for a course
     */
    getLeaderboard: async (userId: string, courseId: string): Promise<LeaderboardResponse> => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        // Parallel fetch: Top 10 list, Current User Rank, Total Enrolled (for percentile)
        const [topList, myRankData, totalEnrolled] = await Promise.all([
            batchRepository.getLeaderboard(courseOid, 10),
            batchRepository.getStudentRank(courseOid, userOid),
            batchRepository.getTotalEnrolledCount(courseOid)
        ]);

        // Calculate percentile
        // Percentile = ((Total - Rank) / Total) * 100
        // If rank is 1 (top), percentile should be 100? Or near 100?
        // Usually ((N - R) / N) * 100. If N=100, R=1, (99/100)*100 = 99%.
        // If N=1, R=1, (0/1)*100 = 0%.
        // Let's use standard formula: ( (N - rank) / N ) * 100
        // Ensure N > 0

        let percentile = 0;
        if (totalEnrolled > 0) {
            percentile = ((totalEnrolled - myRankData.rank) / totalEnrolled) * 100;
            if (percentile < 0) percentile = 0;
        }

        // Add ranks to topList (1-based index)
        const rankedList = topList.entries.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        if (topList.isFromRedis) {
            logger.info("📊 Leaderboard data from Redis sorted set");
        } else {
            logger.info("⚠️ Leaderboard data rebuilt from Mongo");
        }

        return {
            list: rankedList,
            currentUser: {
                rank: myRankData.rank,
                points: myRankData.points,
                percentile: Math.round(percentile * 100) / 100 // Round to 2 decimals
            },
            meta: {
                isLeaderboardCached: topList.isFromRedis
            }
        };
    },
};

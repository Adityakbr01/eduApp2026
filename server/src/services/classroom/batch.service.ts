import mongoose from "mongoose";
import Course from "src/models/course/course.model.js";
import Section from "src/models/course/section.model.js";
import Lesson from "src/models/course/lesson.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import AppError from "src/utils/AppError.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { env } from "src/configs/env.js";

// ============================================
// TYPES
// ============================================
type ItemContentType = "video" | "pdf" | "quiz" | "audio" | "assignment" | "text" | "locked";

interface ModuleItem {
    id: string;
    title: string;
    type: ItemContentType;
    contentType: string;
    completed?: boolean;
    overdue?: boolean;
    daysLate?: number;
    penalty?: number;
    deadline?: string;
    start?: string;
    videoStatus?: string;
    marks?: number;
    obtainedMarks?: number;
    penaltyApplied?: boolean;
}

interface Lesson {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    items: ModuleItem[];
}

interface Module {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    lessons: Lesson[];
}

interface BatchData {
    title: string;
    progress: number;
    modules: number;
    totalModules: number;
    subModules: number;
    totalSubModules: number;
    score: number;
    totalScore: number;
}

interface BatchDetailResponse {
    batchData: BatchData;
    modules: Module[];
    lastVisitedContentId?: string;
}

interface ContentDetailResponse {
    id: string;
    title: string;
    contentType: string;
    marks: number;
    isCompleted: boolean;
    resumeAt: number;
    totalDuration: number;
    obtainedMarks: number;

    videoUrl?: string;
    videoStatus?: string;
    videoDuration?: number;
    minWatchPercent?: number;

    pdfUrl?: string;
    totalPages?: number;

    audioUrl?: string;
    audioDuration?: number;

    assessmentId?: string;
    assessmentType?: string;
    assessment?: {
        type: string;
        data: any;
    };

    deadline?: {
        dueDate?: string;
        startDate?: string;
        penaltyPercent?: number;
        defaultPenalty?: number;
    };
}

// ============================================
// HELPERS
// ============================================

/**
 * Determine display type.
 * "locked" if: startDate is in the future OR video is not READY
 */
function resolveContentType(content: any, now: Date): ItemContentType {
    const startDate = content.deadline?.startDate ? new Date(content.deadline.startDate) : null;

    if (startDate && startDate > now) return "locked";

    if ((content.type as string) === "video" && content.video) {
        if (content.video.status && content.video.status !== "READY") return "locked";
    }

    if ((content.type as string) === "assessment" && content.assessment) {
        return content.assessment.type === "assignment" ? "assignment" : "quiz";
    }

    return content.type as ItemContentType;
}

/**
 * Check if all contents in a given set of lessons are completed by the user.
 */
function areAllContentsCompleted(
    lessonIds: string[],
    contentsByLessonMap: Map<string, any[]>,
    attemptMap: Map<string, any>,
): boolean {
    for (const lessonId of lessonIds) {
        const contents = contentsByLessonMap.get(lessonId) || [];
        for (const content of contents) {
            const attempt = attemptMap.get(content._id.toString());
            if (!attempt?.isCompleted) return false;
        }
    }
    return true;
}

// ============================================
// BATCH SERVICE
// ============================================
export const batchService = {
    /**
     * Get batch detail data for a student
     */
    getBatchDetail: async (userId: string, courseId: string): Promise<BatchDetailResponse> => {
        const userOid = new mongoose.Types.ObjectId(userId);
        const courseOid = new mongoose.Types.ObjectId(courseId);

        const course = await Course.findById(courseOid).select("title batch").lean();
        if (!course) {
            throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const [sections, lessons, contents, attempts] = await Promise.all([
            Section.find({ courseId: courseOid, isDeleted: { $ne: true }, isVisible: { $ne: false } })
                .sort({ order: 1 }).lean(),
            Lesson.find({ courseId: courseOid, isDeleted: { $ne: true }, isVisible: { $ne: false } })
                .sort({ order: 1 }).lean(),
            LessonContent.find({ courseId: courseOid, isDeleted: { $ne: true }, isVisible: { $ne: false } })
                .sort({ order: 1 }).lean(),
            ContentAttempt.find({ userId: userOid, courseId: courseOid }).lean(),
        ]);

        // Get last visited content (most recent access)
        const lastAttempt = await ContentAttempt.findOne({ userId: userOid, courseId: courseOid })
            .sort({ lastAccessedAt: -1 })
            .select("contentId")
            .lean();

        const lastVisitedContentId = lastAttempt?.contentId?.toString();

        // Build lookup maps
        const attemptMap = new Map<string, any>();
        for (const attempt of attempts) {
            attemptMap.set(attempt.contentId.toString(), attempt);
        }

        const lessonsBySectionMap = new Map<string, any[]>();
        for (const lesson of lessons) {
            const sid = lesson.sectionId.toString();
            if (!lessonsBySectionMap.has(sid)) lessonsBySectionMap.set(sid, []);
            lessonsBySectionMap.get(sid)!.push(lesson);
        }

        const contentsByLessonMap = new Map<string, any[]>();
        for (const content of contents) {
            const lid = content.lessonId.toString();
            if (!contentsByLessonMap.has(lid)) contentsByLessonMap.set(lid, []);
            contentsByLessonMap.get(lid)!.push(content);
        }

        // ========================================
        // SEQUENTIAL LOCKING LOGIC
        // ========================================
        // Rule: Section N is unlocked if:
        //   - It's the first section (order index 0), OR
        //   - isManuallyUnlocked = true (instructor override), OR
        //   - All contents in the PREVIOUS section are completed by this user
        //
        // Rule: Lesson N in a section is unlocked if:
        //   - It's the first lesson in its section, OR
        //   - isManuallyUnlocked = true, OR
        //   - All contents in the PREVIOUS lesson (same section) are completed

        const now = new Date();
        let totalCompletedContents = 0;
        let totalContents = 0;
        let completedSections = 0;
        let completedLessons = 0;
        let totalLessons = 0;
        let totalScore = 0;
        let obtainedScore = 0;

        // Track which sections are completed for sequential unlock
        const sectionCompletionMap: boolean[] = [];

        const modules: Module[] = sections.map((section, sectionIndex) => {
            const sectionLessons = lessonsBySectionMap.get(section._id.toString()) || [];

            // Determine if section is locked for this user
            const isFirstSection = sectionIndex === 0;
            const isManuallyUnlocked = (section as any).isManuallyUnlocked === true;
            const prevSectionCompleted = sectionIndex > 0 ? sectionCompletionMap[sectionIndex - 1] : true;
            const sectionIsLocked = !isFirstSection && !isManuallyUnlocked && !prevSectionCompleted;

            const lessonResults: Lesson[] = [];
            let allItemsCompleted = true;
            let sectionHasItems = false;

            // Track lesson completion within this section for sequential lesson unlock
            let prevLessonCompleted = true;

            for (let lessonIndex = 0; lessonIndex < sectionLessons.length; lessonIndex++) {
                const lesson = sectionLessons[lessonIndex];
                totalLessons++;
                const lessonContents = contentsByLessonMap.get(lesson._id.toString()) || [];

                // Determine if lesson is locked
                const isFirstLesson = lessonIndex === 0;
                const lessonManuallyUnlocked = (lesson as any).isManuallyUnlocked === true;
                const lessonIsLocked = sectionIsLocked || (!isFirstLesson && !lessonManuallyUnlocked && !prevLessonCompleted);




                let lessonAllCompleted = true;
                const lessonItems: ModuleItem[] = [];

                for (const content of lessonContents) {
                    sectionHasItems = true;
                    totalContents++;
                    totalScore += content.marks || 0;

                    const contentId = content._id.toString();
                    const attempt = attemptMap.get(contentId);
                    const isCompleted = attempt?.isCompleted || false;

                    if (isCompleted) {
                        totalCompletedContents++;
                        obtainedScore += attempt?.obtainedMarks || 0;
                    } else {
                        lessonAllCompleted = false;
                        allItemsCompleted = false;
                    }

                    // Resolve display type
                    let displayType = resolveContentType(content, now);

                    // Override: if section or lesson is locked, force locked type
                    if (lessonIsLocked && displayType !== "locked") {
                        displayType = "locked";
                    }

                    const isLocked = displayType === "locked";

                    // Deadline logic
                    const deadlineInfo = content.deadline;
                    const dueDate = deadlineInfo?.dueDate ? new Date(deadlineInfo.dueDate) : null;
                    const startDate = deadlineInfo?.startDate ? new Date(deadlineInfo.startDate) : null;
                    const penaltyPercent = deadlineInfo?.penaltyPercent || (deadlineInfo as any)?.defaultPenalty || 0;

                    const item: ModuleItem = {
                        id: contentId,
                        title: content.title,
                        type: displayType,
                        contentType: content.type,
                        completed: isCompleted,
                        marks: content.marks || 0,
                        obtainedMarks: attempt?.obtainedMarks || 0,
                        penaltyApplied: isCompleted && (attempt?.obtainedMarks || 0) < (content.marks || 0),
                    };

                    if ((content.type as string) === "video" && content.video?.status) {
                        item.videoStatus = content.video.status;
                    }

                    if (dueDate && !isCompleted && dueDate < now && !isLocked) {
                        const diffMs = now.getTime() - dueDate.getTime();
                        item.overdue = true;
                        item.daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        item.penalty = penaltyPercent;
                    }

                    if (dueDate && !isLocked && !isCompleted) {
                        item.deadline = dueDate.toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                            hour: "numeric", minute: "numeric", hour12: true,
                        });
                    }

                    if (startDate && startDate > now) {
                        item.start = startDate.toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                            hour: "numeric", minute: "numeric", hour12: true,
                        });
                    }

                    lessonItems.push(item);
                }

                const lessonCompleted = lessonAllCompleted && lessonContents.length > 0;
                if (lessonCompleted) {
                    completedLessons++;
                }
                prevLessonCompleted = lessonCompleted;


                lessonResults.push({
                    id: lesson._id.toString(),
                    title: lesson.title,
                    completed: lessonCompleted,
                    isLocked: lessonIsLocked,
                    items: lessonItems,
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

        // Calculate progress based on score performance, not just completion
        const progress = totalScore > 0
            ? Math.round((obtainedScore / totalScore) * 100 * 100) / 100
            : 0;

        const batchData: BatchData = {
            title: course.title,
            progress,
            modules: completedSections,
            totalModules: sections.length,
            subModules: completedLessons,
            totalSubModules: totalLessons,
            score: obtainedScore,
            totalScore,
        };

        return { batchData, modules, lastVisitedContentId };
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

        // Check if locked by startDate
        if (content.deadline?.startDate && new Date(content.deadline.startDate) > now) {
            throw new AppError("This content is not yet available", STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }

        // Check if video is not ready
        if ((content.type as string) === "video" && content.video?.status && content.video.status !== "READY") {
            throw new AppError(`Video is ${content.video.status.toLowerCase()}. Please try again later.`, STATUSCODE.FORBIDDEN, ERROR_CODE.FORBIDDEN);
        }

        // === SEQUENTIAL LOCK CHECK ===
        // Find the content's lesson, then section, and verify they're not locked for this user
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
                // Check if all contents in previous section are completed
                const prevSection = allSectionsForCourse[sectionIndex - 1];
                const prevLessons = await Lesson.find({
                    courseId: courseOid, sectionId: prevSection._id, isDeleted: { $ne: true },
                }).lean();
                const prevLessonIds = prevLessons.map((l) => l._id.toString());
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
            // Create initial attempt to track access
            attempt = await ContentAttempt.create({
                userId: userOid,
                courseId: courseOid,
                lessonId: content.lessonId,
                contentId: content._id,
                lastAccessedAt: new Date(),
                totalMarks: content.marks || 0
            });
        }

        // Convert to plain object for response
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
                data: content.assessment.refId, // FULL populated object
            };
        }


        if (content.deadline) {
            const dl = content.deadline as any;
            response.deadline = {
                dueDate: dl.dueDate?.toISOString(),
                startDate: dl.startDate?.toISOString(),
                penaltyPercent: dl.penaltyPercent,
                defaultPenalty: dl.defaultPenalty,
            };
        }

        return response;
    },
};

import { emitLeaderboardUpdate } from "src/Socket/socket.js";
import logger from "src/utils/logger.js";
import {
    domainEvents,
    DOMAIN_EVENTS,
    type ContentCompletedPayload,
    type QuizSubmittedPayload,
    type AssignmentGradedPayload,
} from "./domainEvents.js";
import { addProgressJob } from "src/bull/jobs/progress.jobs.js";

// ============================================
// EVENT HANDLERS REGISTRATION
// ============================================
// Each handler is kept lightweight — it just enqueues
// BullMQ jobs for the heavy work. This keeps event
// processing non-blocking and fault-tolerant.

export function registerEventHandlers() {
    logger.info("📡 Registering domain event handlers...");

    // -------------------- CONTENT COMPLETED --------------------
    domainEvents.on(DOMAIN_EVENTS.CONTENT_COMPLETED, async (payload: ContentCompletedPayload) => {
        try {
            const { userId, courseId, contentId, lessonId, obtainedMarks, totalMarks } = payload;

            // 1. Enqueue course progress recalculation
            await addProgressJob.recalculateCourseProgress({
                userId,
                courseId,
                lessonId,
                contentId,
                obtainedMarks,
                totalMarks,
            });

            // 2. Enqueue leaderboard score update
            await addProgressJob.updateLeaderboardScore({
                userId,
                courseId,
            });

            // 3. Enqueue activity log
            await addProgressJob.logActivity({
                userId,
                courseId,
                contentId,
                action: "COMPLETE",
            });

            // 4. Emit real-time Socket.IO update
            emitLeaderboardUpdate(courseId);

            logger.debug(`✅ CONTENT_COMPLETED handlers dispatched for user=${userId} content=${contentId}`);
        } catch (err) {
            logger.error("❌ Error in CONTENT_COMPLETED handler", err);
        }
    });

    // -------------------- QUIZ SUBMITTED --------------------
    domainEvents.on(DOMAIN_EVENTS.QUIZ_SUBMITTED, async (payload: QuizSubmittedPayload) => {
        try {
            const { userId, courseId, contentId } = payload;

            await addProgressJob.logActivity({
                userId,
                courseId,
                contentId,
                action: "SUBMIT",
                metadata: { quizId: payload.quizId, score: payload.score },
            });

            logger.debug(`✅ QUIZ_SUBMITTED handlers dispatched for user=${userId}`);
        } catch (err) {
            logger.error("❌ Error in QUIZ_SUBMITTED handler", err);
        }
    });

    // -------------------- ASSIGNMENT GRADED --------------------
    domainEvents.on(DOMAIN_EVENTS.ASSIGNMENT_GRADED, async (payload: AssignmentGradedPayload) => {
        try {
            const { userId, courseId, contentId } = payload;

            // Recalculate progress (marks changed)
            await addProgressJob.recalculateCourseProgress({
                userId,
                courseId,
                lessonId: "",   // Will be resolved in worker
                contentId,
                obtainedMarks: payload.obtainedMarks,
                totalMarks: payload.totalMarks,
            });

            // Update leaderboard
            await addProgressJob.updateLeaderboardScore({ userId, courseId });

            // Log activity
            await addProgressJob.logActivity({
                userId,
                courseId,
                contentId,
                action: "GRADE",
                metadata: { assignmentId: payload.assignmentId, obtainedMarks: payload.obtainedMarks },
            });

            emitLeaderboardUpdate(courseId);

            logger.debug(`✅ ASSIGNMENT_GRADED handlers dispatched for user=${userId}`);
        } catch (err) {
            logger.error("❌ Error in ASSIGNMENT_GRADED handler", err);
        }
    });

    logger.info("✅ Domain event handlers registered");
}

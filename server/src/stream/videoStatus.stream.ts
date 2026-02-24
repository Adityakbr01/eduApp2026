import LessonContent from "src/models/course/lessonContent.model.js";
import Course from "src/models/course/course.model.js";
import User from "src/models/user/user.model.js";
import emailQueue from "src/bull/queues/email.queue.js";
import { EMAIL_JOB_NAMES } from "src/constants/email-jobs.constants.js";
import logger from "src/utils/logger.js";
import JOB_PRIORITIES from "src/configs/job-priorities.ts.js";
import { env } from "src/configs/env.js";

export function initVideoStatusStream() {
    logger.info("📡 Initializing Video Status Stream...");

    /**
     * DEBUG PIPELINE:
     * Watch ALL updates to debug why READY isn't triggering
     */
    // Watch ALL events for debugging
    const pipeline: any[] = [];

    const changeStream = LessonContent.watch(pipeline, {
        fullDocument: "updateLookup"
    });

    changeStream.on("change", async (change) => {
        try {
            logger.info("⚡ Stream Event Received", {
                type: change.operationType,
                id: (change as any).documentKey?._id
            });

            // DEBUG LOGGING
            if (change.operationType === "update") {
                const updatedFields = change.updateDescription?.updatedFields;
                logger.info(`🔍 LessonContent Update Detected: ${(change as any).documentKey._id}`, updatedFields);
            }

            // logger.info("🔥 Video READY status update detected");

            // RELAXED CHECK: Check full document status instead of just updatedFields
            // This ensures we catch the state even if the update structure varies
            const currentStatus = change.fullDocument?.video?.status;

            if (currentStatus !== "READY") {
                return;
            }

            const lessonContent = change.fullDocument;
            if (!lessonContent) {
                logger.warn("⚠️ fullDocument missing");
                return;
            }

            // Safety validations
            if (lessonContent.type !== "video") {
                // logger.info("⛔ Not video type, skipping...");
                return;
            }

            if (lessonContent.video?.isEmailSent) {
                logger.info("⛔ Email already sent, skipping...");
                return;
            }

            logger.info(
                `🎬 Confirmed READY: ${lessonContent.title} (${lessonContent._id})`
            );

            // Fetch course
            const course = await Course.findById(lessonContent.courseId)
                .select("instructor title")
                .lean();

            if (!course) {
                logger.warn("⚠️ Course not found");
                return;
            }

            // Fetch instructor
            const instructor = await User.findById(course.instructor)
                .select("email name")
                .lean();

            if (!instructor) {
                logger.warn("⚠️ Instructor not found");
                return;
            }

            const videoLink = `${env.PRODUCTION_CLIENT_URL}`;

            // Atomically mark email as sent to prevent race conditions that lead to duplicate emails
            const updated = await LessonContent.findOneAndUpdate(
                {
                    _id: lessonContent._id,
                    $or: [
                        { "video.isEmailSent": false },
                        { "video.isEmailSent": { $exists: false } }
                    ]
                },
                { $set: { "video.isEmailSent": true } },
                { new: true } // Return modified document if matched
            );

            if (!updated) {
                // If it evaluates to null, another concurrent stream event already claimed the dispatch row lock
                logger.info("⛔ Email already handled securely (Atomic Lock), skipping...");
                return;
            }

            // Add email job ONLY if we acquired the atomic update
            await emailQueue.add(
                EMAIL_JOB_NAMES.VIDEO_READY,
                {
                    email: instructor.email,
                    instructorName: instructor.name,
                    videoTitle: lessonContent.title,
                    courseName: course.title,
                    videoLink,
                },
                {
                    priority:
                        JOB_PRIORITIES[EMAIL_JOB_NAMES.VIDEO_READY] || 3,
                }
            );

            logger.info(`📨 Email job securely added for ${instructor.email}`);

        } catch (error) {
            logger.error("❌ Error in Video Status Stream:", error);
        }
    });

    changeStream.on("error", (error) => {
        logger.error("❌ Video Status Stream Error:", error);
    });

    changeStream.on("close", () => {
        logger.warn("⚠️ Video Status Stream closed");
    });
}

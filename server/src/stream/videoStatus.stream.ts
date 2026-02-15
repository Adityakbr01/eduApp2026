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
    const pipeline = [
        {
            $match: {
                operationType: "update",
                // "updateDescription.updatedFields.video.status": "READY" 
            }
        }
    ];

    const changeStream = LessonContent.watch(pipeline, {
        fullDocument: "updateLookup"
    });

    changeStream.on("change", async (change) => {
        try {
            // DEBUG LOGGING
            if (change.operationType === "update") {
                const updatedFields = change.updateDescription?.updatedFields;
                logger.info(`🔍 LessonContent Update Detected: ${change.documentKey._id}`, updatedFields);
            }

            // logger.info("🔥 Video READY status update detected");

            // Extra safety: confirm updated field really READY
            const updatedStatus =
                change.updateDescription?.updatedFields?.["video.status"];

            if (updatedStatus !== "READY") {
                // logger.info("⛔ Status not READY, skipping...");
                return;
            }

            const lessonContent = change.fullDocument;
            if (!lessonContent) {
                logger.warn("⚠️ fullDocument missing");
                return;
            }

            // Safety validations
            if (lessonContent.type !== "video") {
                logger.info("⛔ Not video type, skipping...");
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

            // Add email job
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

            logger.info(`📨 Email job added for ${instructor.email}`);

            // Mark email sent
            await LessonContent.updateOne(
                { _id: lessonContent._id },
                { $set: { "video.isEmailSent": true } }
            );

            logger.info("✅ Marked video as email sent");

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

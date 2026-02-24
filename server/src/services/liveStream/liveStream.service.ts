import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import Course from "src/models/course/course.model.js";
import LessonContent from "src/models/course/lessonContent.model.js";
import LiveStream from "src/models/course/liveStream.model.js";
import Enrollment, { EnrollmentStatus } from "src/models/enrollment.model.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";

export interface CreateLiveSessionInput {
    courseId: string;
    lessonId: string;
    recordingTitle: string;
    recordingDescription?: string;
    scheduledAt?: string;
    autoSaveRecording?: boolean;
    liveId: string;
    serverUrl: string;
    streamKey: string;
    chatSecret?: string;
    chatEmbedCode?: string;
    playerEmbedCode?: string;
}

export const liveStreamService = {

    createLiveSession: async (instructorId: string, input: CreateLiveSessionInput) => {
        const {
            courseId, lessonId, recordingTitle, recordingDescription = "",
            scheduledAt, autoSaveRecording = true,
            liveId, serverUrl, streamKey,
            chatSecret = "", chatEmbedCode = "", playerEmbedCode = "",
        } = input;

        const course = await Course.findById(courseId).select("liveStreamingEnabled title").lean();
        if (!course) throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        if (!(course as any).liveStreamingEnabled) {
            throw new AppError("Live streaming is not enabled for this course. Contact admin.", STATUSCODE.FORBIDDEN, ERROR_CODE.LIVE_NOT_ENABLED);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Calculate next order for the LessonContent
            const lastContent = await LessonContent.findOne({ lessonId })
                .sort({ order: -1 })
                .select("order")
                .session(session)
                .lean();

            const nextOrder = (lastContent?.order ?? 0) + 1;

            // 1. Create Placeholder LessonContent (status: PROCESSING)
            const [lessonContent] = await LessonContent.create([{
                courseId: new mongoose.Types.ObjectId(courseId),
                lessonId: new mongoose.Types.ObjectId(lessonId),
                type: "video",
                title: recordingTitle,
                description: recordingDescription,
                order: nextOrder,
                video: {
                    status: "PROCESSING",
                    videoId: liveId // Pre-assign the videoId to link it in the player
                },
            }], { session });

            // 2. Create LiveStream linked to the new LessonContent
            const [liveStream] = await LiveStream.create([{
                title: recordingTitle,
                courseId: new mongoose.Types.ObjectId(courseId),
                lessonId: new mongoose.Types.ObjectId(lessonId),
                lessonContentId: lessonContent._id,
                instructorId: new mongoose.Types.ObjectId(instructorId),
                liveId, serverUrl, streamKey, chatSecret,
                chatEmbedCode, playerEmbedCode,
                status: "scheduled",
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                autoSaveRecording, recordingTitle, recordingDescription,
            }], { session });

            await session.commitTransaction();
            logger.info("✅ Live session and placeholder content created", { liveStreamId: liveStream._id, liveId });

            return {
                _id: liveStream._id,
                liveId, serverUrl, streamKey,
                title: recordingTitle,
                status: liveStream.status,
                scheduledAt: liveStream.scheduledAt,
            };
        } catch (error) {
            await session.abortTransaction();
            logger.error("❌ Failed to create live session", { error });
            throw error;
        } finally {
            session.endSession();
        }
    },

    enableLiveStreamingForCourse: async (courseId: string) => {
        const course = await Course.findByIdAndUpdate(courseId, { $set: { liveStreamingEnabled: true } }, { new: true });
        if (!course) throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        logger.info("✅ Live streaming enabled for course", { courseId });
        return { courseId, liveStreamingEnabled: true };
    },

    disableLiveStreamingForCourse: async (courseId: string) => {
        const course = await Course.findByIdAndUpdate(courseId, { $set: { liveStreamingEnabled: false } }, { new: true });
        if (!course) throw new AppError("Course not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        logger.info("✅ Live streaming disabled for course", { courseId });
        return { courseId, liveStreamingEnabled: false };
    },

    getInstructorStreams: async (instructorId: string, courseId?: string) => {
        const query: Record<string, any> = { instructorId: new mongoose.Types.ObjectId(instructorId) };
        if (courseId) query.courseId = new mongoose.Types.ObjectId(courseId);

        const dbStreams = await LiveStream.find(query).select("-webhookProcessedEvents").sort({ createdAt: -1 }).lean();

        // Fetch real-time metadata from VdoCipher to merge with DB state
        try {
            const { listLiveStreams } = await import("src/services/liveStream/vdocipher-live.service.js");
            const vdoStreams = await listLiveStreams();

            // Map liveId to VdoLiveStream object
            const vdoStreamMap = new Map(vdoStreams.map((s) => [s.streamId, s]));

            return dbStreams.map((stream) => {
                const liveId = stream.liveId as string;
                const vdoData = vdoStreamMap.get(liveId);

                if (vdoData) {
                    // VdoCipher status mapping: "Streaming Active" -> "live", etc.
                    // We only override the "live" status if VdoCipher confirms it's actively streaming or prepping.
                    let realStatus = stream.status;

                    if (vdoData.status === "Streaming Active") {
                        realStatus = "live";
                    } else if (vdoData.status === "Closed") {
                        realStatus = "ended";
                    }

                    return {
                        ...stream,
                        status: realStatus,
                        viewerCount: vdoData.viewerCount || 0,
                    };
                }

                // If stream is 'ended' in DB but not returned by listLiveStreams, it's accurately ended
                return stream;
            });
        } catch (error) {
            logger.error("❌ Failed to fetch VdoCipher live streams for merge", { instructorId, error });
            return dbStreams; // Fallback to DB state if API fails
        }
    },

    /**
     * Student gets the live stream for a course.
     *
     * ✅ Returns: liveId + chatToken (JWT signed with chatSecret)
     * ✅ Frontend uses:
     *    Player: https://player.vdocipher.com/live-v2?liveId=<ID>&token=<JWT>
     *    Chat:   https://zenstream.chat?liveId=<ID>&token=<JWT>
     *
     * ❌ No OTP. No playbackInfo. Live streams do NOT use /v2/?otp=...
     */
    getStudentLiveStream: async (
        studentId: string,
        courseId: string,
        email: string,
        name: string
    ) => {
        const courseOid = new mongoose.Types.ObjectId(courseId);
        const studentOid = new mongoose.Types.ObjectId(studentId);

        // 1. Run enrollment check + live stream query IN PARALLEL
        //    Single LiveStream query now includes +chatSecret to avoid the second DB call.
        const [enrollment, liveStream] = await Promise.all([
            Enrollment.findOne({
                userId: studentOid,
                courseId: courseOid,
                status: EnrollmentStatus.ACTIVE,
            }).select("_id").lean(),

            LiveStream.findOne({
                courseId: courseOid,
                status: { $in: ["scheduled", "live"] },
            })
                .sort({ scheduledAt: 1 })
                .select("liveId title status courseId lessonId scheduledAt instructorId +chatSecret")
                .lean(),
        ]);

        // Check access: enrolled OR instructor of the stream's course
        const isInstructor = liveStream && String(liveStream.instructorId) === studentId;
        if (!isInstructor && !enrollment) {
            throw new AppError("You are not enrolled in this course", STATUSCODE.FORBIDDEN, ERROR_CODE.NOT_ENROLLED);
        }

        if (!liveStream) {
            throw new AppError(
                "No live stream is currently active or scheduled for this course",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.STREAM_NOT_LIVE
            );
        }

        // 2. Generate chat JWT if stream is live and has a chatSecret (no second query needed)
        let chatToken: string | null = null;

        if (liveStream.status === "live" && liveStream.chatSecret) {
            chatToken = jwt.sign(
                {
                    userId: studentId,
                    userInfo: {
                        username: name || email,
                        avatar: "",
                    },
                },
                liveStream.chatSecret
            );
        }

        // 3. Return liveId + chatToken — frontend builds embed URLs
        return {
            _id: liveStream._id,
            liveId: liveStream.liveId,
            title: liveStream.title,
            status: liveStream.status,
            courseId: liveStream.courseId,
            lessonId: liveStream.lessonId,
            scheduledAt: liveStream.scheduledAt,
            chatToken,
        };
    },

    getStreamRTMPCredentials: async (instructorId: string, streamId: string) => {
        const stream = await LiveStream.findById(streamId).select("+streamKey +chatSecret").lean();
        if (!stream) throw new AppError("Live stream not found", STATUSCODE.NOT_FOUND, ERROR_CODE.LIVE_STREAM_NOT_FOUND);
        if (String(stream.instructorId) !== instructorId) {
            throw new AppError("You are not the owner of this live stream", STATUSCODE.FORBIDDEN, ERROR_CODE.NOT_COURSE_INSTRUCTOR);
        }

        return {
            _id: stream._id,
            liveId: stream.liveId,
            serverUrl: stream.serverUrl,
            streamKey: stream.streamKey,
            chatSecret: stream.chatSecret,
            status: stream.status,
        };
    },

    updateStreamStatus: async (instructorId: string, streamId: string, status: "live" | "ended") => {
        if (!["live", "ended"].includes(status)) {
            throw new AppError("Invalid status", STATUSCODE.BAD_REQUEST, ERROR_CODE.VALIDATION_ERROR);
        }

        const stream = await LiveStream.findById(streamId);
        if (!stream) throw new AppError("Live stream not found", STATUSCODE.NOT_FOUND, ERROR_CODE.LIVE_STREAM_NOT_FOUND);
        if (String(stream.instructorId) !== instructorId) {
            throw new AppError("You do not own this live stream", STATUSCODE.FORBIDDEN, ERROR_CODE.NOT_COURSE_INSTRUCTOR);
        }
        if (stream.status === status) return stream;

        const previousStatus = stream.status;
        stream.status = status;
        await stream.save();

        // Notify enrolled students when going live
        if (previousStatus === "scheduled" && status === "live") {
            try {
                const course = await Course.findById(stream.courseId).select("title -_id").lean();
                const courseTitle = course?.title || "your enrolled course";

                const { NotificationService } = await import("src/services/Notification/notification.service.js");
                const { Types } = await import("mongoose");

                await NotificationService.sendNotification({
                    courseId: stream.courseId as any,
                    title: `Live Class Started: ${courseTitle}`,
                    message: `A new live session "${stream.recordingTitle}" is happening right now! Join in!`,
                    category: "INFO",
                    level: "LOW",
                    type: "LIVE_STREAM_STARTED",
                    link: `/courses/${stream.courseId}/live`,
                    createdBy: new Types.ObjectId(instructorId),
                });

                logger.info(`✅ Successfully queued Live notification via NotificationService for course ${stream.courseId}`);
            } catch (err) {
                logger.error("❌ Failed to push Live Stream notifications:", err);
            }
        }

        // Emit socket update
        try {
            const { emitLiveStreamStatusUpdate } = await import("src/Socket/socket.js");
            emitLiveStreamStatusUpdate(stream.courseId.toString(), { streamId: stream._id.toString(), status });
            logger.info(`✅ Successfully emitted socket update for stream status: ${status}`);
        } catch (err) {
            logger.error("❌ Failed to emit socket update for Live Stream:", err);
        }

        // Clear viewer count when ending
        if (status === "ended") {
            // End the stream on VdoCipher's side (permanent stop)
            try {
                const { endLiveStream } = await import("src/services/liveStream/vdocipher-live.service.js");
                await endLiveStream(stream.liveId);
                logger.info("✅ VdoCipher live stream ended via API", { liveId: stream.liveId });
            } catch (err) {
                logger.error("❌ Failed to end VdoCipher live stream (continuing with local update)", err);
            }

            const { clearViewerCount } = await import("src/utils/liveViewerCounter.js");
            await clearViewerCount(stream.liveId);
            logger.info("🧹 Viewer count cleared");
        }

        logger.info(`✅ Stream status manually updated to ${status}`);
        return stream;
    },

    createRecordingLessonContent: async (liveId: string, recordedVideoId: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const liveStream = await LiveStream.findOne({ liveId }).session(session);
            if (!liveStream) {
                logger.error("❌ LiveStream not found for recording", { liveId });
                await session.abortTransaction();
                return;
            }

            if (liveStream.recordingProcessed) {
                logger.warn("⚠️ Recording already processed, skipping", { liveId });
                await session.abortTransaction();
                return;
            }

            if (liveStream.lessonContentId) {
                // Update the existing placeholder LessonContent
                await LessonContent.updateOne(
                    { _id: liveStream.lessonContentId },
                    {
                        $set: {
                            "video.videoId": recordedVideoId,
                            "video.status": "READY"
                        }
                    },
                    { session }
                );
                logger.info("🔄 Placeholder LessonContent updated with recording", { lessonContentId: liveStream.lessonContentId });
            } else {
                // Fallback for legacy streams that didn't create a placeholder upfront
                const lastContent = await LessonContent.findOne({ lessonId: liveStream.lessonId })
                    .sort({ order: -1 })
                    .select("order")
                    .session(session)
                    .lean();

                const nextOrder = (lastContent?.order ?? 0) + 1;

                await LessonContent.create([{
                    courseId: liveStream.courseId,
                    lessonId: liveStream.lessonId,
                    type: "video",
                    title: liveStream.recordingTitle,
                    description: liveStream.recordingDescription,
                    order: nextOrder,
                    video: { videoId: recordedVideoId, status: "READY" },
                }], { session });
            }

            liveStream.recordedVideoId = recordedVideoId;
            liveStream.recordingProcessed = true;
            await liveStream.save({ session });

            await session.commitTransaction();
            logger.info("✅ Recording LessonContent created successfully", { liveId, recordedVideoId });
        } catch (error) {
            await session.abortTransaction();
            logger.error("❌ Failed to create recording LessonContent", { liveId, recordedVideoId, error });
            throw error;
        } finally {
            session.endSession();
        }
    },
};
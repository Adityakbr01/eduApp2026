import { Types } from "mongoose";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import { AssignmentSubmission, QuizAttempt } from "src/models/assessment/index.js";
import { Course } from "src/models/course/index.js";
import type { IQuizQuestion } from "src/models/course/quiz.model.js";
import { assignmentRepository, quizRepository } from "src/repositories/assessment.repository.js";
import { batchRepository } from "src/repositories/classroom/batch.repository.js";
import { contentAttemptRepository } from "src/repositories/contentAttempt.repository.js";
import { courseProgressRepository } from "src/repositories/progress/courseProgress.repository.js";
import { lessonRepository } from "src/repositories/lesson.repository.js";
import { lessonContentRepository } from "src/repositories/lessonContent.repository.js";
import { emitLeaderboardUpdate } from "src/Socket/socket.js";
import type {
    CreateAssignmentInput,
    CreateQuizInput,
    SubmitAssignmentInput,
    UpdateAssignmentInput,
    UpdateQuizInput
} from "src/schemas/assessment.schema.js";
import { addProgressJob } from "src/bull/jobs/progress.jobs.js";
import AppError from "src/utils/AppError.js";
import logger from "src/utils/logger.js";







// ============================================
// QUIZ SERVICE
// ============================================
export const quizService = {
    // -------------------- CREATE QUIZ --------------------
    createQuiz: async (data: CreateQuizInput) => {
        // Verify content exists and is of type quiz
        const content = await lessonContentRepository.findById(data.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if quiz already exists for this content
        const existingQuiz = await quizRepository.findByContentId(data.contentId);
        if (existingQuiz) {
            throw new AppError(
                "Quiz already exists for this content",
                STATUSCODE.CONFLICT,
                ERROR_CODE.ALREADY_EXISTS
            );
        }

        // Calculate total marks from questions
        const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

        const quiz = await quizRepository.create({
            ...data,
            totalMarks,
            type: "quiz",
        });

        // Update content with assessment reference
        await lessonContentRepository.updateById(data.contentId, {
            assessment: {
                refId: quiz._id.toString(),
                type: "quiz",
            },
        });

        return quiz;
    },

    // -------------------- GET QUIZ BY ID --------------------
    getQuizById: async (quizId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return quiz;
    },

    // -------------------- GET QUIZ BY CONTENT ID --------------------
    getQuizByContentId: async (contentId: string) => {
        const quiz = await quizRepository.findByContentId(contentId);
        // Return null if not found (don't throw error - quiz may not be created yet)
        return quiz;
    },

    // -------------------- GET QUIZ FOR STUDENT --------------------
    getQuizForStudent: async (quizId: string) => {
        const quiz = await quizRepository.findForStudent(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return quiz;
    },

    // -------------------- GET QUIZZES BY LESSON --------------------
    getQuizzesByLesson: async (lessonId: string) => {
        return quizRepository.findByLessonId(lessonId);
    },

    // -------------------- GET QUIZZES BY COURSE --------------------
    getQuizzesByCourse: async (courseId: string) => {
        return quizRepository.findByCourseId(courseId);
    },

    // -------------------- UPDATE QUIZ --------------------
    updateQuiz: async (quizId: string, data: UpdateQuizInput) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // If questions are updated, recalculate total marks
        let updateData: any = { ...data };
        if (data.questions) {
            updateData.totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        }

        return quizRepository.update(quizId, updateData);
    },

    // -------------------- DELETE QUIZ --------------------
    deleteQuiz: async (quizId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Clear assessment reference from content
        await lessonContentRepository.updateById(quiz.contentId.toString(), {
            assessment: undefined,
        });

        return quizRepository.delete(quizId);
    },

    // -------------------- ADD QUESTION --------------------
    addQuestion: async (quizId: string, question: IQuizQuestion) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return quizRepository.addQuestion(quizId, question);
    },

    // -------------------- UPDATE QUESTION --------------------
    updateQuestion: async (quizId: string, questionId: string, questionData: Partial<IQuizQuestion>) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const questionExists = quiz.questions.some((q) => q._id?.toString() === questionId);
        if (!questionExists) {
            throw new AppError("Question not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        return quizRepository.updateQuestion(quizId, questionId, questionData);
    },

    // -------------------- REMOVE QUESTION --------------------
    removeQuestion: async (quizId: string, questionId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        if (quiz.questions.length <= 1) {
            throw new AppError(
                "Quiz must have at least one question",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        return quizRepository.removeQuestion(quizId, questionId);
    },

    // -------------------- SUBMIT QUIZ QUESTION (STUDENT) --------------------
    submitQuestion: async (
        userId: string,
        quizId: string,
        data: { questionId: string; selectedOptionIndex: number }
    ) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const content = await lessonContentRepository.findById(quiz.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const lesson = await lessonRepository.findById(content.lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if question exists
        const question = quiz.questions.find((q) => q._id?.toString() === data.questionId);
        if (!question) {
            throw new AppError("Question not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Get or create ContentAttempt
        let attempt = await contentAttemptRepository.findByUserAndContent(userId, quiz.contentId);
        if (!attempt) {
            attempt = await contentAttemptRepository.upsert(userId, quiz.contentId, {
                courseId: quiz.courseId,
                lessonId: quiz.lessonId,
                totalMarks: quiz.totalMarks,
            });
        }

        // Get or create QuizAttempt
        let quizAttempt = await QuizAttempt.findOne({ userId, quizId });
        if (!quizAttempt) {
            quizAttempt = await QuizAttempt.create({
                userId,
                quizId,
                contentAttemptId: attempt._id,
                totalMarks: quiz.totalMarks,
                responses: [],
            });
        }

        // 🛑 GUARD: Prevent re-answering after quiz is completed
        if (quizAttempt.isCompleted) {
            throw new AppError(
                "Quiz already completed. You cannot re-answer questions.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        // 🛑 GUARD: Prevent re-answering already answered questions
        const alreadyAnswered = quizAttempt.responses.some(
            (r) => r.questionId.toString() === data.questionId
        );
        if (alreadyAnswered) {
            throw new AppError(
                "You have already answered this question.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        // Calculate: Correct?
        const isCorrect = question.correctAnswerIndex === data.selectedOptionIndex;
        let earnedMarks = isCorrect ? question.marks : 0;

        // ⏰ DEADLINE CHECK & PENALTY
        let penaltyApplied = false;
        if (lesson.deadline?.dueDate && new Date() > new Date(lesson.deadline.dueDate)) {
            const penaltyPercent = lesson.deadline.penaltyPercent || 0;
            if (penaltyPercent > 0 && earnedMarks > 0) {
                earnedMarks = Math.floor(earnedMarks * (1 - penaltyPercent / 100));
                penaltyApplied = true;
            }
        }

        // Add response to QuizAttempt
        quizAttempt.responses.push({
            questionId: new Types.ObjectId(data.questionId),
            selectedOptionIndex: data.selectedOptionIndex,
            isCorrect,
            marks: earnedMarks,
        });

        // Recalculate score
        quizAttempt.score = quizAttempt.responses.reduce((sum, r) => sum + r.marks, 0);

        // Check if all questions answered --> Mark quiz as completed
        const allAnswered = quiz.questions.every((q) =>
            quizAttempt?.responses.some((r) => r.questionId.toString() === q._id?.toString())
        );

        if (allAnswered) {
            quizAttempt.isCompleted = true;
            quizAttempt.completedAt = new Date();
        }

        await quizAttempt.save();

        // Sync with ContentAttempt
        await contentAttemptRepository.upsert(userId, quiz.contentId, {
            obtainedMarks: quizAttempt.score,
            isCompleted: allAnswered,
        });

        await batchRepository.invalidateUserProgress(userId, quiz.courseId.toString());
        await batchRepository.invalidateLeaderboard(quiz.courseId.toString());
        await courseProgressRepository.recalculate(userId, quiz.courseId.toString());

        // Async jobs for leaderboard and logging
        await addProgressJob.updateLeaderboardScore({ userId, courseId: quiz.courseId.toString() });
        await addProgressJob.logActivity({
            userId,
            courseId: quiz.courseId.toString(),
            contentId: quiz.contentId.toString(),
            action: "SUBMIT",
            metadata: { quizId, score: quizAttempt.score }
        });

        emitLeaderboardUpdate(quiz.courseId.toString());

        return {
            isCorrect,
            earnedMarks,
            penaltyApplied,
            totalScore: quizAttempt.score,
            totalMarks: quiz.totalMarks,
            questionsAnswered: quizAttempt.responses.length,
            totalQuestions: quiz.questions.length,
            isQuizCompleted: allAnswered,
            correctAnswerIndex: quiz.showCorrectAnswers ? question.correctAnswerIndex : undefined,
            explanation: quiz.showCorrectAnswers ? question.explanation : undefined,
        };
    },

    // -------------------- GET QUIZ ATTEMPT (STUDENT) --------------------
    getQuizAttempt: async (userId: string, quizId: string) => {
        const quiz = await quizRepository.findById(quizId);
        if (!quiz) {
            throw new AppError("Quiz not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const quizAttempt = await QuizAttempt.findOne({ userId, quizId }).lean();

        if (!quizAttempt) {
            return {
                attempted: false,
                quiz: {
                    title: quiz.title,
                    totalMarks: quiz.totalMarks,
                    passingMarks: quiz.passingMarks || 0,
                    totalQuestions: quiz.questions.length,
                    timeLimit: quiz.timeLimit,
                },
            };
        }

        // Build per-question breakdown
        const breakdown = quiz.questions.map((q) => {
            const response = quizAttempt.responses.find(
                (r) => r.questionId.toString() === q._id?.toString()
            );
            return {
                questionId: q._id?.toString(),
                question: q.question,
                options: q.options,
                marks: q.marks,
                selectedOptionIndex: response?.selectedOptionIndex ?? null,
                isCorrect: response?.isCorrect ?? null,
                earnedMarks: response?.marks ?? 0,
                correctAnswerIndex: quiz.showCorrectAnswers ? q.correctAnswerIndex : undefined,
                explanation: quiz.showCorrectAnswers ? q.explanation : undefined,
                answered: !!response,
            };
        });

        return {
            attempted: true,
            isCompleted: quizAttempt.isCompleted,
            score: quizAttempt.score,
            totalMarks: quizAttempt.totalMarks,
            passingMarks: quiz.passingMarks || 0,
            passed: quiz.passingMarks ? quizAttempt.score >= quiz.passingMarks : true,
            questionsAnswered: quizAttempt.responses.length,
            totalQuestions: quiz.questions.length,
            completedAt: quizAttempt.completedAt,
            breakdown,
            quiz: {
                title: quiz.title,
                totalMarks: quiz.totalMarks,
                passingMarks: quiz.passingMarks || 0,
                totalQuestions: quiz.questions.length,
                timeLimit: quiz.timeLimit,
            },
        };
    },
};

// ============================================
// ASSIGNMENT SERVICE
// ============================================
export const assignmentService = {
    // -------------------- CREATE ASSIGNMENT --------------------
    createAssignment: async (data: CreateAssignmentInput) => {
        // Verify content exists
        const content = await lessonContentRepository.findById(data.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Check if assignment already exists for this content
        const existingAssignment = await assignmentRepository.findByContentId(data.contentId);
        if (existingAssignment) {
            throw new AppError(
                "Assignment already exists for this content",
                STATUSCODE.CONFLICT,
                ERROR_CODE.ALREADY_EXISTS
            );
        }

        const assignment = await assignmentRepository.create({
            ...data,
            type: "assignment",
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        });

        // Update content with assessment reference
        await lessonContentRepository.updateById(data.contentId, {
            assessment: {
                refId: assignment._id.toString(),
                type: "assignment",
            },
        });

        return assignment;
    },

    // -------------------- GET ASSIGNMENT BY ID --------------------
    getAssignmentById: async (assignmentId: string) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }
        return assignment;
    },

    // -------------------- GET ASSIGNMENT BY CONTENT ID --------------------
    getAssignmentByContentId: async (contentId: string) => {
        const assignment = await assignmentRepository.findByContentId(contentId);
        // Return null if not found (don't throw error - assignment may not be created yet)
        return assignment;
    },

    // -------------------- GET ASSIGNMENTS BY LESSON --------------------
    getAssignmentsByLesson: async (lessonId: string) => {
        return assignmentRepository.findByLessonId(lessonId);
    },

    // -------------------- GET ASSIGNMENTS BY COURSE --------------------
    getAssignmentsByCourse: async (courseId: string) => {
        return assignmentRepository.findByCourseId(courseId);
    },

    // -------------------- UPDATE ASSIGNMENT --------------------
    updateAssignment: async (assignmentId: string, data: UpdateAssignmentInput) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const updateData: any = { ...data };
        if (data.dueDate) {
            updateData.dueDate = new Date(data.dueDate);
        }

        return assignmentRepository.update(assignmentId, updateData);
    },

    // -------------------- DELETE ASSIGNMENT --------------------
    deleteAssignment: async (assignmentId: string) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Clear assessment reference from content
        await lessonContentRepository.updateById(assignment.contentId.toString(), {
            assessment: undefined,
        });

        return assignmentRepository.delete(assignmentId);
    },

    // -------------------- GET UPCOMING ASSIGNMENTS --------------------
    getUpcomingAssignments: async (courseId: string) => {
        return assignmentRepository.findUpcoming(courseId);
    },

    // -------------------- GET OVERDUE ASSIGNMENTS --------------------
    getOverdueAssignments: async (courseId: string) => {
        return assignmentRepository.findOverdue(courseId);
    },

    // -------------------- SUBMIT ASSIGNMENT (STUDENT) --------------------
    submitAssignment: async (
        userId: string,
        assignmentId: string,
        data: SubmitAssignmentInput
    ) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // 🛑 GUARD: Prevent duplicate submissions
        const existingSubmission = await AssignmentSubmission.findOne({ userId, assignmentId });
        if (existingSubmission) {
            throw new AppError(
                "You have already submitted this assignment.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.ALREADY_EXISTS
            );
        }

        const content = await lessonContentRepository.findById(assignment.contentId);
        if (!content) {
            throw new AppError("Content not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const lesson = await lessonRepository.findById(content.lessonId);
        if (!lesson) {
            throw new AppError("Lesson not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        // Get or create ContentAttempt
        let attempt = await contentAttemptRepository.findByUserAndContent(userId, assignment.contentId);
        if (!attempt) {
            attempt = await contentAttemptRepository.upsert(userId, assignment.contentId, {
                courseId: assignment.courseId,
                lessonId: assignment.lessonId,
                totalMarks: assignment.totalMarks,
            });
        }

        // ⏰ DEADLINE CHECK
        const now = new Date();
        const dueDate = lesson.deadline?.dueDate ? new Date(lesson.deadline.dueDate) : null;
        const isLate = !!(dueDate && now > dueDate);

        let penaltyPercent = 0;
        if (isLate && lesson.deadline) {
            penaltyPercent = lesson.deadline.penaltyPercent || 0;
        }

        // Resolve submission content
        const submissionContent =
            data.submissionType === "file" ? data.fileUrl :
                data.submissionType === "link" ? data.linkUrl :
                    data.submissionType === "code" ? data.codeContent :
                        data.textContent;

        if (!submissionContent) {
            throw new AppError(
                "Submission content is required.",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        // Create Submission
        const submission = await AssignmentSubmission.create({
            userId,
            assignmentId,
            contentAttemptId: attempt._id,
            submissionType: data.submissionType,
            content: submissionContent,
            codeLanguage: data.codeLanguage,
            isLate,
            penalty: {
                percent: penaltyPercent,
                deductedMarks: 0 // Calculated during grading
            }
        });

        // Mark ContentAttempt as completed (submitted)
        await contentAttemptRepository.upsert(userId, assignment.contentId, {
            isCompleted: true,
        });

        await batchRepository.invalidateUserProgress(userId, assignment.courseId.toString());
        await batchRepository.invalidateLeaderboard(assignment.courseId.toString());
        await courseProgressRepository.recalculate(userId, assignment.courseId.toString());

        // Async jobs for leaderboard and logging
        await addProgressJob.updateLeaderboardScore({ userId, courseId: assignment.courseId.toString() });
        await addProgressJob.logActivity({
            userId,
            courseId: assignment.courseId.toString(),
            contentId: assignment.contentId.toString(),
            action: "SUBMIT",
            metadata: { assignmentId, submissionType: data.submissionType }
        });

        emitLeaderboardUpdate(assignment.courseId.toString());

        return {
            submissionId: submission._id,
            submittedAt: submission.submittedAt,
            isLate,
            penaltyPercent,
            submissionType: submission.submissionType,
        };
    },

    // -------------------- GET ASSIGNMENT SUBMISSION (STUDENT) --------------------
    getAssignmentSubmission: async (userId: string, assignmentId: string) => {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError("Assignment not found", STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND);
        }

        const submission = await AssignmentSubmission.findOne({ userId, assignmentId }).lean();

        if (!submission) {
            return {
                submitted: false,
                assignment: {
                    title: assignment.title,
                    description: assignment.description,
                    instructions: assignment.instructions,
                    totalMarks: assignment.totalMarks,
                    submissionConfig: assignment.submission,
                },
            };
        }

        return {
            submitted: true,
            submissionId: submission._id,
            submissionType: submission.submissionType,
            content: submission.content,
            codeLanguage: submission.codeLanguage,
            submittedAt: submission.submittedAt,
            isLate: submission.isLate,
            penalty: submission.penalty,
            grade: submission.grade || null,
            isGraded: !!submission.grade?.gradedAt,
            assignment: {
                title: assignment.title,
                description: assignment.description,
                instructions: assignment.instructions,
                totalMarks: assignment.totalMarks,
                submissionConfig: assignment.submission,
            },
        };
    },

    // -------------------- GET ALL ASSIGNMENTS WITH SUBMISSION COUNTS (INSTRUCTOR) --------------------
    getAssignmentsWithSubmissions: async (instructorId: string) => {
        if (!instructorId || !Types.ObjectId.isValid(instructorId)) {
            throw new AppError(
                "Valid Instructor ID is required",
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT
            );
        }

        const instructorOid = new Types.ObjectId(instructorId);

        // 1️⃣ Get all courses of instructor
        const courses = await Course.find(
            {
                instructor: instructorOid,          // ✅ FIXED FIELD
                "Deleted.isDeleted": { $ne: true }, // ✅ Ignore deleted
            },
            { _id: 1, title: 1 }
        ).lean();

        logger.info("Instructor courses found:", courses.length);

        if (!courses.length) return [];

        const courseIds = courses.map(c => c._id);
        const courseMap = new Map(
            courses.map(c => [c._id.toString(), c.title])
        );

        // 2️⃣ Get all assignments of these courses
        const Assignment = (await import("src/models/course/assignment.model.js")).default;

        const assignments = await Assignment.find(
            {
                courseId: { $in: courseIds },
            },
            {
                _id: 1,
                title: 1,
                courseId: 1,
                totalMarks: 1,
                dueDate: 1,
            }
        )
            .sort({ createdAt: -1 })
            .lean();

        logger.info("Assignments found:", assignments.length);

        if (!assignments.length) return [];

        // 3️⃣ Aggregate submission stats
        const assignmentIds = assignments.map(a => a._id);

        const submissionAgg = await AssignmentSubmission.aggregate([
            {
                $match: {
                    assignmentId: { $in: assignmentIds },
                },
            },
            {
                $group: {
                    _id: "$assignmentId",
                    total: { $sum: 1 },
                    graded: {
                        $sum: {
                            $cond: [
                                { $ifNull: ["$grade.gradedAt", false] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const submissionMap = new Map(
            submissionAgg.map(s => [
                s._id.toString(),
                { total: s.total, graded: s.graded },
            ])
        );

        // 4️⃣ Final response
        return assignments.map(a => {
            const counts = submissionMap.get(a._id.toString()) || {
                total: 0,
                graded: 0,
            };

            return {
                id: a._id,
                title: a.title,
                courseId: a.courseId,
                courseTitle: courseMap.get(a.courseId.toString()) ?? "Unknown",
                totalMarks: a.totalMarks,
                dueDate: a.dueDate,
                totalSubmissions: counts.total,
                gradedCount: counts.graded,
                hasSubmissions: counts.total > 0, // ✅ frontend-friendly
            };
        });
    },
    // -------------------- GET ALL SUBMISSIONS (INSTRUCTOR) --------------------
    async getSubmissions(assignmentId: string) {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError(
                "Assignment not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
            );
        }

        const submissions = await AssignmentSubmission.find({ assignmentId })
            .populate("userId", "name email avatar")
            .sort({ submittedAt: -1 })
            .lean();

        return {
            assignment: {
                id: assignment._id,
                title: assignment.title,
                totalMarks: assignment.totalMarks,
                dueDate: assignment.dueDate,
            },
            submissions: submissions.map((s: any) => ({
                id: s._id,
                student: s.userId,
                submissionType: s.submissionType,
                content: s.content,
                codeLanguage: s.codeLanguage,
                submittedAt: s.submittedAt,
                isLate: s.isLate,
                penalty: s.penalty,
                grade: s.grade || null,
                isGraded: !!s.grade?.gradedAt,
            })),
            totalSubmissions: submissions.length,
            gradedCount: submissions.filter((s: any) => s.grade?.gradedAt).length,
        };
    },

    // -------------------- GRADE ASSIGNMENT (INSTRUCTOR) --------------------
    async gradeAssignment(
        submissionId: string,
        gradedBy: string,
        data: { obtainedMarks: number; feedback?: string },
    ) {
        const submission = await AssignmentSubmission.findById(submissionId);
        if (!submission) {
            throw new AppError(
                "Submission not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
            );
        }

        const assignment = await assignmentRepository.findById(
            submission.assignmentId.toString(),
        );
        if (!assignment) {
            throw new AppError(
                "Assignment not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
            );
        }

        if (data.obtainedMarks > assignment.totalMarks) {
            throw new AppError(
                `Marks cannot exceed total marks (${assignment.totalMarks})`,
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT,
            );
        }

        // Apply penalty reduction if late
        let finalMarks = data.obtainedMarks;
        if (submission.isLate && submission.penalty?.percent) {
            const penaltyDeduction = (data.obtainedMarks * submission.penalty.percent) / 100;
            finalMarks = Math.round(data.obtainedMarks - penaltyDeduction);
        }

        submission.grade = {
            obtainedMarks: finalMarks,
            feedback: data.feedback,
            gradedBy: new Types.ObjectId(gradedBy),
            gradedAt: new Date(),
        };
        await submission.save();

        // Update contentAttempt with obtained marks
        if (submission.contentAttemptId) {
            const { ContentAttempt } = await import("src/models/course/index.js");
            await ContentAttempt.findByIdAndUpdate(
                submission.contentAttemptId,
                { $set: { obtainedMarks: finalMarks } },
            );
        }

        // INVALIDATE CACHE
        await batchRepository.invalidateUserProgress(submission.userId.toString(), assignment.courseId.toString());
        await batchRepository.invalidateLeaderboard(assignment.courseId.toString());
        await courseProgressRepository.recalculate(submission.userId.toString(), assignment.courseId.toString());

        // Async jobs for leaderboard and logging
        await addProgressJob.updateLeaderboardScore({ userId: submission.userId.toString(), courseId: assignment.courseId.toString() });
        await addProgressJob.logActivity({
            userId: submission.userId.toString(),
            courseId: assignment.courseId.toString(),
            contentId: assignment.contentId.toString(),
            action: "GRADE",
            metadata: {
                assignmentId: assignment._id.toString(),
                submissionId: submission._id.toString(),
                obtainedMarks: finalMarks
            }
        });

        emitLeaderboardUpdate(assignment.courseId.toString());

        return {
            submissionId: submission._id,
            finalMarks,
            penaltyApplied: submission.isLate && !!submission.penalty?.percent,
            originalMarks: data.obtainedMarks,
            gradedAt: submission.grade.gradedAt,
        };
    },

    // -------------------- GRADE ALL SUBMISSIONS (INSTRUCTOR) --------------------
    async gradeAllSubmissions(
        assignmentId: string,
        gradedBy: string,
        data: { marks: number; feedback?: string },
    ) {
        const assignment = await assignmentRepository.findById(assignmentId);
        if (!assignment) {
            throw new AppError(
                "Assignment not found",
                STATUSCODE.NOT_FOUND,
                ERROR_CODE.NOT_FOUND,
            );
        }

        if (data.marks > assignment.totalMarks) {
            throw new AppError(
                `Marks cannot exceed total marks (${assignment.totalMarks})`,
                STATUSCODE.BAD_REQUEST,
                ERROR_CODE.INVALID_INPUT,
            );
        }

        // 1. Find all PENDING (ungraded) submissions
        // querying where grade.gradedAt is missing or null
        const submissions = await AssignmentSubmission.find({
            assignmentId,
            "grade.gradedAt": { $exists: false },
        });

        if (submissions.length === 0) {
            return {
                updatedCount: 0,
                message: "No pending submissions to grade.",
            };
        }

        // 2. Prepare bulk updates
        const now = new Date();
        const graderId = new Types.ObjectId(gradedBy);
        const userIdsToUpdate = new Set<string>();

        // Using a loop for now to handle individual logic (late penalty, etc.)
        // Optimization: Could use bulkWrite if logic permits, but detailed activity logging logic makes loop safer/easier
        for (const submission of submissions) {
            // Calculate marks with penalty
            let finalMarks = data.marks;
            if (submission.isLate && submission.penalty?.percent) {
                const penaltyDeduction = (data.marks * submission.penalty.percent) / 100;
                finalMarks = Math.round(data.marks - penaltyDeduction);
            }

            submission.grade = {
                obtainedMarks: finalMarks,
                feedback: data.feedback,
                gradedBy: graderId,
                gradedAt: now,
            };
            await submission.save();

            // Update ContentAttempt
            if (submission.contentAttemptId) {
                const { ContentAttempt } = await import("src/models/course/index.js");
                await ContentAttempt.findByIdAndUpdate(
                    submission.contentAttemptId,
                    { $set: { obtainedMarks: finalMarks } },
                );
            }

            userIdsToUpdate.add(submission.userId.toString());

            // Side Effects (Per User)
            // Invalidating user progress cache
            await batchRepository.invalidateUserProgress(submission.userId.toString(), assignment.courseId.toString());
            // Recalculate course progress
            await courseProgressRepository.recalculate(submission.userId.toString(), assignment.courseId.toString());

            // Async jobs
            await addProgressJob.updateLeaderboardScore({ userId: submission.userId.toString(), courseId: assignment.courseId.toString() });
            await addProgressJob.logActivity({
                userId: submission.userId.toString(),
                courseId: assignment.courseId.toString(),
                contentId: assignment.contentId.toString(),
                action: "GRADE",
                metadata: {
                    assignmentId: assignment._id.toString(),
                    submissionId: submission._id.toString(),
                    obtainedMarks: finalMarks,
                    bulk: true
                }
            });
        }

        // 3. Batch Level Side Effects (Once per course)
        await batchRepository.invalidateLeaderboard(assignment.courseId.toString());
        emitLeaderboardUpdate(assignment.courseId.toString());

        return {
            updatedCount: submissions.length,
            message: `Successfully graded ${submissions.length} submissions.`,
        };
    },
};

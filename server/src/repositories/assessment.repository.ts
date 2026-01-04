
// ============================================
// QUIZ REPOSITORY

import type { Types } from "mongoose";
import Assignment, { type IAssignment } from "src/models/course/assignment.model.js";
import Quiz, { type IQuiz, type IQuizQuestion } from "src/models/course/quiz.model.js";

// Input types that accept strings for ObjectId fields (Mongoose will auto-convert)
type QuizCreateInput = Omit<Partial<IQuiz>, 'courseId' | 'lessonId' | 'contentId'> & {
    courseId?: string | Types.ObjectId;
    lessonId?: string | Types.ObjectId;
    contentId?: string | Types.ObjectId;
};

type AssignmentCreateInput = Omit<Partial<IAssignment>, 'courseId' | 'lessonId' | 'contentId'> & {
    courseId?: string | Types.ObjectId;
    lessonId?: string | Types.ObjectId;
    contentId?: string | Types.ObjectId;
};

// ============================================
export const quizRepository = {
    // Create a new quiz
    create: async (data: QuizCreateInput) => {
        return Quiz.create(data);
    },

    // Find quiz by ID
    findById: async (id: string | Types.ObjectId) => {
        return Quiz.findById(id);
    },

    // Find quiz by content ID
    findByContentId: async (contentId: string | Types.ObjectId) => {
        return Quiz.findOne({ contentId });
    },

    // Find quizzes by lesson ID
    findByLessonId: async (lessonId: string | Types.ObjectId) => {
        return Quiz.find({ lessonId }).sort({ createdAt: -1 });
    },

    // Find quizzes by course ID
    findByCourseId: async (courseId: string | Types.ObjectId) => {
        return Quiz.find({ courseId }).sort({ createdAt: -1 });
    },

    // Update quiz
    update: async (id: string | Types.ObjectId, data: Partial<IQuiz>) => {
        return Quiz.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete quiz
    delete: async (id: string | Types.ObjectId) => {
        return Quiz.findByIdAndDelete(id);
    },

    // Delete quiz by content ID
    deleteByContentId: async (contentId: string | Types.ObjectId) => {
        return Quiz.findOneAndDelete({ contentId });
    },

    // Add question to quiz
    addQuestion: async (quizId: string | Types.ObjectId, question: IQuizQuestion) => {
        return Quiz.findByIdAndUpdate(
            quizId,
            { $push: { questions: question } },
            { new: true, runValidators: true }
        );
    },

    // Update question in quiz
    updateQuestion: async (
        quizId: string | Types.ObjectId,
        questionId: string | Types.ObjectId,
        questionData: Partial<IQuizQuestion>
    ) => {
        const updateFields: Record<string, any> = {};
        Object.keys(questionData).forEach((key) => {
            updateFields[`questions.$.${key}`] = (questionData as any)[key];
        });

        return Quiz.findOneAndUpdate(
            { _id: quizId, "questions._id": questionId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );
    },

    // Remove question from quiz
    removeQuestion: async (quizId: string | Types.ObjectId, questionId: string | Types.ObjectId) => {
        return Quiz.findByIdAndUpdate(
            quizId,
            { $pull: { questions: { _id: questionId } } },
            { new: true }
        );
    },

    // Get quiz for student (without correct answers if configured)
    findForStudent: async (id: string | Types.ObjectId) => {
        const quiz = await Quiz.findById(id).lean();
        if (!quiz) return null;

        // If not showing correct answers, remove them
        if (!quiz.showCorrectAnswers) {
            quiz.questions = quiz.questions.map((q) => ({
                ...q,
                correctAnswerIndex: -1, // Hide correct answer
                explanation: undefined,
            }));
        }
        return quiz;
    },
};

// ============================================
// ASSIGNMENT REPOSITORY
// ============================================
export const assignmentRepository = {
    // Create a new assignment
    create: async (data: AssignmentCreateInput) => {
        return Assignment.create(data);
    },

    // Find assignment by ID
    findById: async (id: string | Types.ObjectId) => {
        return Assignment.findById(id);
    },

    // Find assignment by content ID
    findByContentId: async (contentId: string | Types.ObjectId) => {
        return Assignment.findOne({ contentId });
    },

    // Find assignments by lesson ID
    findByLessonId: async (lessonId: string | Types.ObjectId) => {
        return Assignment.find({ lessonId }).sort({ createdAt: -1 });
    },

    // Find assignments by course ID
    findByCourseId: async (courseId: string | Types.ObjectId) => {
        return Assignment.find({ courseId }).sort({ createdAt: -1 });
    },

    // Update assignment
    update: async (id: string | Types.ObjectId, data: Partial<IAssignment>) => {
        return Assignment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    // Delete assignment
    delete: async (id: string | Types.ObjectId) => {
        return Assignment.findByIdAndDelete(id);
    },

    // Delete assignment by content ID
    deleteByContentId: async (contentId: string | Types.ObjectId) => {
        return Assignment.findOneAndDelete({ contentId });
    },

    // Find upcoming assignments (with due dates)
    findUpcoming: async (courseId: string | Types.ObjectId) => {
        return Assignment.find({
            courseId,
            dueDate: { $gte: new Date() },
        }).sort({ dueDate: 1 });
    },

    // Find overdue assignments
    findOverdue: async (courseId: string | Types.ObjectId) => {
        return Assignment.find({
            courseId,
            dueDate: { $lt: new Date() },
        }).sort({ dueDate: -1 });
    },
};

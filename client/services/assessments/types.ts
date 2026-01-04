// ==================== QUIZ TYPES ====================

export interface IQuizQuestion {
    _id?: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    marks: number;
    explanation?: string;
}

export interface IQuiz {
    _id: string;
    courseId: string;
    lessonId: string;
    contentId: string;
    type: "quiz";
    title: string;
    description?: string;
    totalMarks: number;
    passingMarks?: number;
    timeLimit?: number; // in minutes
    questions: IQuizQuestion[];
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
    maxAttempts: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuizDTO {
    courseId: string;
    lessonId: string;
    contentId: string;
    title: string;
    description?: string;
    passingMarks?: number;
    timeLimit?: number;
    questions: Omit<IQuizQuestion, "_id">[];
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showCorrectAnswers?: boolean;
    maxAttempts?: number;
}

export type UpdateQuizDTO = Partial<Omit<CreateQuizDTO, "courseId" | "lessonId" | "contentId">>;

// ==================== ASSIGNMENT TYPES ====================

export interface ISubmissionConfig {
    type: "file" | "text" | "link" | "code";
    allowedFormats?: string[];
    maxFileSizeMB?: number;
}

export interface IAssignment {
    _id: string;
    courseId: string;
    lessonId: string;
    contentId: string;
    type: "assignment";
    title: string;
    description: string;
    instructions: string[];
    submission: ISubmissionConfig;
    totalMarks: number;
    dueDate?: string;
    isAutoEvaluated: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssignmentDTO {
    courseId: string;
    lessonId: string;
    contentId: string;
    title: string;
    description: string;
    instructions?: string[];
    submission?: ISubmissionConfig;
    totalMarks?: number;
    dueDate?: string;
    isAutoEvaluated?: boolean;
}

export type UpdateAssignmentDTO = Partial<Omit<CreateAssignmentDTO, "courseId" | "lessonId" | "contentId">>;

// ==================== QUIZ ATTEMPT TYPES ====================

export interface IQuizAnswer {
    questionId: string;
    selectedOptionIndex: number;
}

export interface IQuizAttempt {
    _id: string;
    quizId: string;
    userId: string;
    answers: IQuizAnswer[];
    score: number;
    totalMarks: number;
    isPassed: boolean;
    timeTaken?: number; // in seconds
    attemptNumber: number;
    createdAt: string;
}

export interface SubmitQuizAttemptDTO {
    answers: IQuizAnswer[];
    timeTaken?: number;
}

export interface QuizAttemptResult {
    score: number;
    totalMarks: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    results: {
        questionId: string;
        isCorrect: boolean;
        selectedIndex: number;
        correctIndex: number;
    }[];
}

// ==================== ASSIGNMENT SUBMISSION TYPES ====================

export interface IAssignmentSubmission {
    _id: string;
    assignmentId: string;
    userId: string;
    submissionType: "file" | "text" | "link" | "code";
    fileUrl?: string;
    textContent?: string;
    linkUrl?: string;
    codeContent?: string;
    codeLanguage?: string;
    submittedAt: string;
    isGraded: boolean;
    obtainedMarks?: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: string;
}

export interface SubmitAssignmentDTO {
    submissionType: "file" | "text" | "link" | "code";
    fileUrl?: string;
    textContent?: string;
    linkUrl?: string;
    codeContent?: string;
    codeLanguage?: string;
}

export interface GradeAssignmentDTO {
    obtainedMarks: number;
    feedback?: string;
}

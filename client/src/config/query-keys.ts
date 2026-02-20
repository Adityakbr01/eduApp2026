export const QUERY_KEYS = {
    // Auth
    AUTH: {
        ME: ["auth", "me"],
        PROFILE: ["auth", "profile"],
    },

    // Users
    USERS: {
        ALL: ["users"],
        LIST: (page: number) => ["users", "list", page],
        DETAIL: (id: string) => ["users", "detail", id],
        ROLES_PERMISSIONS: ["users", "roles-permissions"],
        ALL_ROLES_PERMISSIONS: ["users", "all-roles-permissions"],
        MY_ROLES_PERMISSIONS: ["users", "my-roles-permissions"]
    },
    // Courses
    COURSES: {
        ALL: ["courses"],
        FEATURED: ["courses", "featured"],
        BY_CATEGORY: ["courses", "by-category"],
        BY_SLUG: ["courses", "by-slug"],
        BY_ID: ["courses", "by-id"],
        MANAGE: ["courses", "manage"],
        INSTRUCTOR_COURSES: ["courses", "instructor"],
        INSTRUCTOR_METRICS: ["courses", "instructor-metrics"],
        ADMIN_ALL: ["courses", "admin"],
        LIST: (page: number) => ["courses", "list", page],
        DETAIL: (id: string) => ["courses", "detail", id],
        // Sections
        SECTIONS: (courseId: string) => ["courses", "sections", courseId],
        // Lessons
        LESSONS: (sectionId: string) => ["courses", "lessons", sectionId],
        // Contents
        CONTENTS: (lessonId: string) => ["courses", "contents", lessonId],
    },
    // Assessments
    ASSESSMENTS: {
        // Quiz
        QUIZ_BY_ID: (quizId: string) => ["assessments", "quiz", quizId],
        QUIZ_BY_CONTENT: (contentId: string) => ["assessments", "quiz", "content", contentId],
        QUIZZES_BY_LESSON: (lessonId: string) => ["assessments", "quizzes", "lesson", lessonId],
        QUIZZES_BY_COURSE: (courseId: string) => ["assessments", "quizzes", "course", courseId],
        QUIZ_FOR_STUDENT: (quizId: string) => ["assessments", "quiz", "student", quizId],
        // Assignment
        ASSIGNMENT_BY_ID: (assignmentId: string) => ["assessments", "assignment", assignmentId],
        ASSIGNMENT_BY_CONTENT: (contentId: string) => ["assessments", "assignment", "content", contentId],
        ASSIGNMENTS_BY_LESSON: (lessonId: string) => ["assessments", "assignments", "lesson", lessonId],
        ASSIGNMENTS_BY_COURSE: (courseId: string) => ["assessments", "assignments", "course", courseId],
        UPCOMING_ASSIGNMENTS: (courseId: string) => ["assessments", "assignments", "upcoming", courseId],
    },
    // Categories
    CATEGORIES: {
        ALL: ["categories"],
        ROOT: ["categories", "root"],
        TREE: ["categories", "tree"],
        WITH_SUBCATEGORIES: ["categories", "with-subcategories"],
        FEATURED: ["categories", "featured"],
        SUBCATEGORIES: ["categories", "subcategories"],
        BY_ID: ["categories", "by-id"],
        BY_SLUG: ["categories", "by-slug"],
    },

    // Enrollment
    ENROLLMENT: {
        STATUS: (courseId: string) => ["enrollment", "status", courseId],
        MY_COURSES: ["enrollment", "my-courses"],
        MY_COURSES_PAGINATED: (page: number) => ["enrollment", "my-courses", page],
    },

    // Payments
    PAYMENTS: {
        HISTORY: ["payments", "history"],
        HISTORY_PAGINATED: (page: number) => ["payments", "history", page],
        DETAIL: (paymentId: string) => ["payments", "detail", paymentId],
    },

    // Reviews
    REVIEWS: {
        BY_COURSE: (courseId: string) => ["reviews", "course", courseId],
        BY_COURSE_PAGINATED: (courseId: string, page: number) => ["reviews", "course", courseId, page],
        MY_REVIEW: (courseId: string) => ["reviews", "my-review", courseId],
    },

    // Classroom
    CLASSROOM: {
        DATA: ["classroom", "data"],
        BATCH: (courseId: string) => ["classroom", "batch", courseId],
        CONTENT: (courseId: string, contentId: string) => ["classroom", "content", courseId, contentId],
        LESSON: (courseId: string, lessonId: string) => ["classroom", "lesson", courseId, lessonId],
        LEADERBOARD: (courseId: string) => ["classroom", "leaderboard", courseId],
    },

    PREFERENCES: ["preferences"],
};

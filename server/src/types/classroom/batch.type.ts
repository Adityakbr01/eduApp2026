// ============================================
// TYPES
// ============================================
export interface LessonResult {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    marks: number;
    obtainedMarks: number;
    overdue?: boolean;
    daysLate?: number;
    penalty?: number;
    deadline?: string;
    start?: string;
}

export interface Module {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    lessons: LessonResult[];
}

export interface BatchData {
    title: string;
    progress: number;
    modules: number;
    totalModules: number;
    subModules: number;
    totalSubModules: number;
    score: number;
    totalScore: number;
}

export interface BatchDetailResponse {
    batchData: BatchData;
    modules: Module[];
    lastVisitedId?: string;
    meta?: {
        isStructureCached: boolean;
        isProgressCached: boolean;
    };
}

export interface ContentDetailResponse {
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

    isManuallyUnlocked?: boolean;
    tags?: string[];
    description?: string;
    level?: string;
    relatedLinks?: { title: string, url: string }[];
}

export interface AggContent {
    _id: any; // mongoose.Types.ObjectId
    type: string;
    marks: number;
    isCompleted: boolean;
    obtainedMarks: number;
    lastAttemptedAt?: Date | null;
    videoStatus?: string | null;
    assessmentType?: string | null;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar?: {
        url: string;
        version: number;
    };
    points: number;
    rank?: number; // Optional as it might be computed later
}

export interface LeaderboardResponse {
    list: LeaderboardEntry[];
    currentUser: {
        rank: number;
        points: number;
        percentile: number;
    } | null;
}


// ============================================
// CACHED TYPES
// ============================================

// 1. Structure (Cached)
// 1. Structure (Cached)
export interface CachedContentMeta {
    _id: string; // string for redis compatibility
    type: string;
    marks: number;
    videoStatus?: string | null;
    assessmentType?: string | null;
}

export interface CachedLesson {
    _id: string;
    title: string;
    order: number;
    isManuallyUnlocked?: boolean;
    deadline?: {
        dueDate?: string;
        startDate?: string;
        penaltyPercent?: number;
    };
    contents: CachedContentMeta[];
}

export interface CachedSection {
    _id: string;
    title: string;
    order: number;
    isManuallyUnlocked?: boolean;
    lessons: CachedLesson[];
}

// 2. User Progress (Cached)
export interface UserProgressMap {
    // contentId -> { completed, marks, updatedAt }
    [contentId: string]: {
        isCompleted: boolean;
        obtainedMarks: number;
        lastAttemptedAt: string | null; // ISO string
    };
}

export interface UserCourseProgress {
    history: UserProgressMap;
    lastVisitedId?: string;
} 
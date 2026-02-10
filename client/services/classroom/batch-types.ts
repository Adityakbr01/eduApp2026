// ==================== BATCH TYPES ====================

export type ItemContentType = "video" | "pdf" | "quiz" | "audio" | "assignment" | "text" | "locked";

export interface ModuleItem {
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

export interface Lesson {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    items: ModuleItem[];
}

export interface Module {
    id: string;
    title: string;
    completed: boolean;
    isLocked: boolean;
    lessons: Lesson[];
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
    lastVisitedContentId?: string;
}

// ==================== CONTENT DETAIL TYPES ====================

export interface ContentDetailResponse {
    id: string;
    title: string;
    contentType: string;
    marks: number;
    isCompleted: boolean;
    resumeAt: number;
    totalDuration: number;
    obtainedMarks: number;

    // Video
    videoUrl?: string;
    videoStatus?: string;
    videoDuration?: number;
    minWatchPercent?: number;

    // PDF
    pdfUrl?: string;
    totalPages?: number;

    // Audio
    audioUrl?: string;
    audioDuration?: number;

    // Assessment
    // Assessment
    assessment?: {
        type: string;
        data: any; // Full populated quiz/assignment object
    };

    // Deadline
    deadline?: {
        dueDate?: string;
        startDate?: string;
        penaltyPercent?: number;
        defaultPenalty?: number;
    };
}

export type ContentDetail = ContentDetailResponse;

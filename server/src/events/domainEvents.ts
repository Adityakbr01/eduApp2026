import { EventEmitter } from "events";
import logger from "src/utils/logger.js";

// ============================================
// DOMAIN EVENTS
// ============================================
// Lightweight in-process event bus for domain events.
// Handlers enqueue BullMQ jobs for heavy async work.
// This keeps the service layer clean and decoupled.

// -------------------- EVENT TYPES --------------------
export const DOMAIN_EVENTS = {
    CONTENT_COMPLETED: "CONTENT_COMPLETED",
    CONTENT_PROGRESS_UPDATED: "CONTENT_PROGRESS_UPDATED",
    QUIZ_SUBMITTED: "QUIZ_SUBMITTED",
    ASSIGNMENT_GRADED: "ASSIGNMENT_GRADED",
    PROGRESS_UPDATED: "PROGRESS_UPDATED",
} as const;

// -------------------- EVENT PAYLOADS --------------------
export interface ContentCompletedPayload {
    userId: string;
    courseId: string;
    lessonId: string;
    contentId: string;
    obtainedMarks: number;
    totalMarks: number;
}

export interface ContentProgressUpdatedPayload {
    userId: string;
    courseId: string;
    contentId: string;
    obtainedMarks: number;
}

export interface QuizSubmittedPayload {
    userId: string;
    courseId: string;
    contentId: string;
    quizId: string;
    score: number;
    totalMarks: number;
}

export interface AssignmentGradedPayload {
    userId: string;
    courseId: string;
    contentId: string;
    assignmentId: string;
    obtainedMarks: number;
    totalMarks: number;
}

export interface ProgressUpdatedPayload {
    userId: string;
    courseId: string;
}

// -------------------- EVENT MAP --------------------
export interface DomainEventMap {
    [DOMAIN_EVENTS.CONTENT_COMPLETED]: ContentCompletedPayload;
    [DOMAIN_EVENTS.CONTENT_PROGRESS_UPDATED]: ContentProgressUpdatedPayload;
    [DOMAIN_EVENTS.QUIZ_SUBMITTED]: QuizSubmittedPayload;
    [DOMAIN_EVENTS.ASSIGNMENT_GRADED]: AssignmentGradedPayload;
    [DOMAIN_EVENTS.PROGRESS_UPDATED]: ProgressUpdatedPayload;
}

// -------------------- EVENT BUS --------------------
class DomainEventBus {
    private emitter: EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(20); // Allow multiple handlers per event
    }

    /**
     * Emit a domain event
     */
    emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void {
        logger.debug(`📡 Domain Event: ${event}`, { payload });
        this.emitter.emit(event, payload);
    }

    /**
     * Register an event handler
     */
    on<K extends keyof DomainEventMap>(event: K, handler: (payload: DomainEventMap[K]) => void): void {
        this.emitter.on(event, handler);
    }

    /**
     * Register a one-time handler
     */
    once<K extends keyof DomainEventMap>(event: K, handler: (payload: DomainEventMap[K]) => void): void {
        this.emitter.once(event, handler);
    }

    /**
     * Remove a handler
     */
    off<K extends keyof DomainEventMap>(event: K, handler: (payload: DomainEventMap[K]) => void): void {
        this.emitter.off(event, handler);
    }
}

// Singleton
export const domainEvents = new DomainEventBus();

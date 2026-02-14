import DATE_FORMAT from "src/helpers/DATE_FORMAT.js";
import type { AggContent } from "src/types/classroom/batch.type.js";
import type { LessonResult } from "src/types/classroom/batch.type.js";

function computeLessonMeta(
    contents: AggContent[],
    now: Date,
    lessonIsLocked: boolean,
    lessonDeadline?: {
        dueDate?: Date | null;
        startDate?: Date | null;
        penaltyPercent?: number;
    }
): Omit<LessonResult, "id" | "title" | "completed" | "isLocked"> {

    let marks = 0;
    let obtainedMarks = 0;

    let overdue = false;
    let maxDaysLate = 0; // We'll just track if *any* content was submitted late relative to lesson deadline? 
    // Actually, usually "Overdue" means the *lesson* is incomplete and past due.
    // OR if items were submitted after the deadline.

    const skipOverdue = lessonIsLocked;

    const dueDate = lessonDeadline?.dueDate ? new Date(lessonDeadline.dueDate) : null;
    const startDate = lessonDeadline?.startDate ? new Date(lessonDeadline.startDate) : null;
    const penaltyPercent = lessonDeadline?.penaltyPercent || 0;

    for (const c of contents) {
        marks += c.marks || 0;
        if (c.isCompleted) {
            obtainedMarks += c.obtainedMarks || 0;
        }

        const lastAttemptedAt = c.lastAttemptedAt ? new Date(c.lastAttemptedAt) : null;

        // -------------------------------
        // 🔥 OVERDUE CALCULATION (Per Item check against Lesson Deadline)
        // -------------------------------
        if (!skipOverdue && dueDate) {
            let isLate = false;
            let daysLate = 0;

            // 1. Incomplete + Lesson Past Due
            if (!c.isCompleted && dueDate < now) {
                isLate = true;
                const diffMs = now.getTime() - dueDate.getTime();
                daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            }
            // 2. Completed + Submitted Late (Item submitted after lesson deadline)
            else if (c.isCompleted && lastAttemptedAt && lastAttemptedAt > dueDate) {
                isLate = true;
                const diffMs = lastAttemptedAt.getTime() - dueDate.getTime();
                daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            }

            if (isLate && daysLate > 0) {
                overdue = true;
                if (daysLate > maxDaysLate) maxDaysLate = daysLate;
            }
        }
    }

    const result: Omit<LessonResult, "id" | "title" | "completed" | "isLocked"> = {
        marks,
        obtainedMarks,
        overdue: false,
    };

    // Apply overdue only if allowed
    if (!skipOverdue && overdue) {
        result.overdue = true;
        result.daysLate = maxDaysLate;
        result.penalty = penaltyPercent;
    }

    if (dueDate) {
        result.deadline = dueDate.toLocaleDateString("en-US", DATE_FORMAT);
    }

    if (startDate) {
        result.start = startDate.toLocaleDateString("en-US", DATE_FORMAT);
    }

    return result;
}

export default computeLessonMeta;

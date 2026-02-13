import DATE_FORMAT from "src/helpers/DATE_FORMAT.js";
import type { AggContent } from "src/types/classroom/batch.type.js";
import type { LessonResult } from "src/types/classroom/batch.type.js";

function computeLessonMeta(
    contents: AggContent[],
    now: Date,
    lessonIsLocked: boolean,
): Omit<LessonResult, "id" | "title" | "completed" | "isLocked"> {

    let marks = 0;
    let obtainedMarks = 0;

    let overdue = false;
    let maxDaysLate = 0;
    let maxPenalty = 0;

    let earliestDeadline: Date | null = null;
    let latestDeadline: Date | null = null;
    let earliestStart: Date | null = null;

    const skipOverdue = lessonIsLocked;
    // ✅ Only skip overdue calculation — NOT deadline/start

    for (const c of contents) {

        marks += c.marks || 0;

        if (c.isCompleted) {
            obtainedMarks += c.obtainedMarks || 0;
        }

        const dueDate = c.dueDate ? new Date(c.dueDate) : null;
        const startDate = c.startDate ? new Date(c.startDate) : null;
        const lastAttemptedAt = c.lastAttemptedAt ? new Date(c.lastAttemptedAt) : null;

        // Track latest deadline (fallback use)
        if (dueDate) {
            if (!latestDeadline || dueDate > latestDeadline) {
                latestDeadline = dueDate;
            }
        }

        // -------------------------------
        // 🔥 OVERDUE CALCULATION
        // -------------------------------
        if (!skipOverdue && dueDate) {

            let isLate = false;
            let daysLate = 0;

            // 1. Incomplete + Past Due
            if (!c.isCompleted && dueDate < now) {
                isLate = true;
                const diffMs = now.getTime() - dueDate.getTime();
                daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            }

            // 2. Completed + Submitted Late
            else if (c.isCompleted && lastAttemptedAt && lastAttemptedAt > dueDate) {
                isLate = true;
                const diffMs = lastAttemptedAt.getTime() - dueDate.getTime();
                daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            }

            if (isLate && daysLate > 0) {
                overdue = true;
                if (daysLate > maxDaysLate) maxDaysLate = daysLate;
                if ((c.penaltyPercent || 0) > maxPenalty) {
                    maxPenalty = c.penaltyPercent || 0;
                }
            }
        }

        // -------------------------------
        // ✅ ALWAYS compute upcoming deadline
        // -------------------------------
        if (dueDate && !c.isCompleted && dueDate >= now) {
            if (!earliestDeadline || dueDate < earliestDeadline) {
                earliestDeadline = dueDate;
            }
        }

        // -------------------------------
        // ✅ ALWAYS compute future start
        // -------------------------------
        if (startDate) {
            if (!earliestStart || startDate < earliestStart) {
                earliestStart = startDate;
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
        result.penalty = maxPenalty;
    }

    // -------------------------------
    // 🎯 Deadline selection logic
    // -------------------------------
    let deadlineToShow = earliestDeadline;

    if (!deadlineToShow && !result.overdue && latestDeadline) {
        deadlineToShow = latestDeadline;
    }

    if (deadlineToShow && !result.overdue) {
        result.deadline = deadlineToShow.toLocaleDateString("en-US", DATE_FORMAT);
    }

    if (earliestStart) {
        result.start = earliestStart.toLocaleDateString("en-US", DATE_FORMAT);
    }

    return result;
}

export default computeLessonMeta;

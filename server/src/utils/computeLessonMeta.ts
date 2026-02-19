import DATE_FORMAT from "src/helpers/DATE_FORMAT.js";
import type { AggContent } from "src/types/classroom/batch.type.js";
import type { LessonResult } from "src/types/classroom/batch.type.js";
import { resolvePenalty } from "./penalty.util.js";

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
    let rawObtainedMarks = 0;

    let overdue = false;
    let maxDaysLate = 0;

    const skipOverdue = lessonIsLocked;

    const dueDate = lessonDeadline?.dueDate
        ? new Date(lessonDeadline.dueDate)
        : null;

    const startDate = lessonDeadline?.startDate
        ? new Date(lessonDeadline.startDate)
        : null;

    // ================================
    // 1️⃣ Aggregate Marks
    // ================================
    for (const c of contents) {
        marks += c.marks || 0;

        if (c.isCompleted) {
            rawObtainedMarks += c.obtainedMarks || 0;
        }

        if (!skipOverdue && dueDate) {
            const lastAttemptedAt = c.lastAttemptedAt
                ? new Date(c.lastAttemptedAt)
                : null;

            let daysLate = 0;

            // Incomplete + Past Due
            if (!c.isCompleted && dueDate < now) {
                daysLate = Math.floor(
                    (now.getTime() - dueDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
            }

            // Completed + Submitted Late
            else if (
                c.isCompleted &&
                lastAttemptedAt &&
                lastAttemptedAt > dueDate
            ) {
                daysLate = Math.floor(
                    (lastAttemptedAt.getTime() - dueDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
            }

            if (daysLate > 0) {
                overdue = true;
                maxDaysLate = Math.max(maxDaysLate, daysLate);
            }
        }
    }

    let finalObtainedMarks = rawObtainedMarks;
    let penaltyPercent = 0;

    // ================================
    // 2️⃣ Apply Penalty (READ-TIME)
    // ================================
    if (!skipOverdue && overdue) {
        penaltyPercent = resolvePenalty(
            maxDaysLate,
            lessonDeadline?.penaltyPercent
        );

        if (penaltyPercent > 0 && rawObtainedMarks > 0) {
            const deduction = Math.round(
                (rawObtainedMarks * penaltyPercent) / 100
            );

            finalObtainedMarks = Math.max(
                rawObtainedMarks - deduction,
                0
            );
        }
    }

    // ================================
    // 3️⃣ Prepare Result
    // ================================
    const result: Omit<
        LessonResult,
        "id" | "title" | "completed" | "isLocked"
    > = {
        marks,
        obtainedMarks: finalObtainedMarks,
        overdue,
    };

    if (overdue) {
        result.daysLate = maxDaysLate;
        result.penalty = penaltyPercent;
    }

    if (dueDate) {
        result.deadline = dueDate.toLocaleDateString(
            "en-US",
            DATE_FORMAT
        );
    }

    if (startDate) {
        result.start = startDate.toLocaleDateString(
            "en-US",
            DATE_FORMAT
        );
    }

    return result;
}

export default computeLessonMeta;

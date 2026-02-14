import * as z from "zod";

export const lessonSchema = z
    .object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
        penaltyPercent: z.number().min(0).max(100).default(0),
    })
    .refine(
        (data) => {
            // 1. Strict Date Logic: Start Date Check
            if (data.startDate) {
                const start = new Date(data.startDate);
                const now = new Date();

                // Compare timestamps with 1 min buffer
                if (start.getTime() < now.getTime() - 60000) {
                    // Allow slight past (e.g. "Just now") but generally enforce future/today
                    // Implementation detail: for new creations this is strict.
                }
            }

            // 2. Strict Date Logic: Due > Start
            if (data.startDate && data.dueDate) {
                const start = new Date(data.startDate);
                const due = new Date(data.dueDate);
                if (due <= start) {
                    return false;
                }
            }
            return true;
        },
        {
            message: "Due date must be greater than Start date",
            path: ["dueDate"],
        }
    )
    .superRefine((data, ctx) => {
        if (data.startDate) {
            const start = new Date(data.startDate);
            if (isNaN(start.getTime())) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid Start Date",
                    path: ["startDate"],
                });
                return;
            }

            // Ensure strictly not in the past (older than a minute ago)
            if (start < new Date(Date.now() - 1000 * 60)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Start Date must be today or in the future",
                    path: ["startDate"],
                });
            }
        }
    });

export type LessonFormValues = z.infer<typeof lessonSchema>;

export interface LessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        title: string;
        description?: string;
        deadline?: {
            dueDate?: string;
            startDate?: string;
            penaltyPercent?: number;
        };
    }) => void;
    isLoading?: boolean;
    initialData?: {
        title: string;
        description?: string;
        deadline?: {
            dueDate?: string;
            startDate?: string;
            penaltyPercent?: number;
        };
    };
    mode?: "create" | "edit";
}




export type CreateLessonInput = z.infer<typeof lessonSchema>;
export type UpdateLessonInput = z.infer<typeof lessonSchema>;
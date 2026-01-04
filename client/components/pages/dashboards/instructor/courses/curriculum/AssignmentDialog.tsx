"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Plus,
    Trash2,
    FileText,
    Upload,
    Link,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useCreateAssignment, useUpdateAssignment } from "@/services/assessments";
import { IAssignment } from "@/services/assessments/types";

// Submission types
const SUBMISSION_TYPES = [
    { value: "file", label: "File Upload" },
    { value: "text", label: "Text/Essay" },
    { value: "link", label: "URL/Link" },
] as const;

// Common file formats
const ALLOWED_FORMATS = [
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "DOC" },
    { value: "docx", label: "DOCX" },
    { value: "txt", label: "TXT" },
    { value: "zip", label: "ZIP" },
    { value: "jpg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "mp4", label: "MP4" },
    { value: "mp3", label: "MP3" },
];

// Schema for assignment form
const assignmentFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    instructions: z.array(z.string().min(1, "Instruction cannot be empty")).min(1, "At least one instruction required"),
    submission: z.object({
        type: z.enum(["file", "text", "link"]),
        allowedFormats: z.array(z.string()).optional(),
        maxFileSizeMB: z.number().min(1).max(100).optional(),
    }),
    totalMarks: z.number().min(0),
    dueDateStr: z.string().optional(), // Use string for date input
    isAutoEvaluated: z.boolean(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    lessonId: string;
    contentId: string;
    existingAssignment?: IAssignment | null;
}

export function AssignmentDialog({
    open,
    onOpenChange,
    courseId,
    lessonId,
    contentId,
    existingAssignment,
}: AssignmentDialogProps) {
    const createAssignment = useCreateAssignment();
    const updateAssignment = useUpdateAssignment(existingAssignment?._id || "");
    const isEditing = !!existingAssignment;

    const getDefaultValues = (assignment?: IAssignment | null): AssignmentFormValues => {
        if (assignment) {
            return {
                title: assignment.title,
                description: assignment.description || "",
                instructions: assignment.instructions?.length ? assignment.instructions : [""],
                submission: {
                    type: (assignment.submission?.type as "file" | "text" | "link") || "file",
                    allowedFormats: assignment.submission?.allowedFormats || ["pdf", "doc", "docx"],
                    maxFileSizeMB: assignment.submission?.maxFileSizeMB || 10,
                },
                totalMarks: assignment.totalMarks || 100,
                dueDateStr: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : "",
                isAutoEvaluated: assignment.isAutoEvaluated || false,
            };
        }
        return {
            title: "",
            description: "",
            instructions: [""],
            submission: {
                type: "file",
                allowedFormats: ["pdf", "doc", "docx"],
                maxFileSizeMB: 10,
            },
            totalMarks: 100,
            dueDateStr: "",
            isAutoEvaluated: false,
        };
    };

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: getDefaultValues(existingAssignment),
    });

    // Reset form when existingAssignment changes
    useEffect(() => {
        if (open) {
            form.reset(getDefaultValues(existingAssignment));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingAssignment, open]);

    const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
        control: form.control,
        name: "instructions" as never,
    });

    const submissionType = form.watch("submission.type");
    const isLoading = createAssignment.isPending || updateAssignment.isPending;
    const createError = createAssignment.error;
    const updateError = updateAssignment.error;
    const error = createError || updateError;
    const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (error as { message?: string })?.message;

    const handleClose = () => {
        form.reset();
        createAssignment.reset();
        updateAssignment.reset();
        onOpenChange(false);
    };

    const onSubmit = async (values: AssignmentFormValues) => {
        try {
            const payload = {
                title: values.title,
                description: values.description || "",
                instructions: values.instructions,
                submission: {
                    type: values.submission.type,
                    ...(values.submission.type === "file" && {
                        allowedFormats: values.submission.allowedFormats,
                        maxFileSizeMB: values.submission.maxFileSizeMB,
                    }),
                },
                totalMarks: values.totalMarks,
                dueDate: values.dueDateStr ? new Date(values.dueDateStr).toISOString() : undefined,
                isAutoEvaluated: values.isAutoEvaluated,
            };

            if (isEditing) {
                await updateAssignment.mutateAsync(payload);
            } else {
                await createAssignment.mutateAsync({
                    courseId,
                    lessonId,
                    contentId,
                    title: payload.title,
                    description: payload.description,
                    instructions: payload.instructions,
                    submission: payload.submission,
                    totalMarks: payload.totalMarks,
                    dueDate: payload.dueDate,
                    isAutoEvaluated: payload.isAutoEvaluated,
                });
            }
            handleClose();
        } catch (error) {
            console.error("Error saving assignment:", error);
        }
    };

    const getSubmissionIcon = () => {
        switch (submissionType) {
            case "file": return <Upload className="h-4 w-4" />;
            case "text": return <FileText className="h-4 w-4" />;
            case "link": return <Link className="h-4 w-4" />;
            default: return <Upload className="h-4 w-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update assignment details and requirements"
                            : "Create a new assignment for this lesson content"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                        <div className="space-y-6 pb-4 pr-2">
                            {/* Error Alert */}
                            {errorMessage && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            {/* Basic Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Assignment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter assignment title" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description of the assignment"
                                                        {...field}
                                                        disabled={isLoading}
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="totalMarks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Marks</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dueDateStr"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Due Date (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isAutoEvaluated"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <div className="space-y-0.5">
                                                    <FormLabel className="!mt-0">Auto-Evaluate</FormLabel>
                                                    <FormDescription>
                                                        Automatically grade submissions if possible
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Instructions ({instructionFields.length})
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {instructionFields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-2">
                                            <Badge variant="secondary" className="mt-2 shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <FormField
                                                control={form.control}
                                                name={`instructions.${index}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                placeholder={`Instruction ${index + 1}`}
                                                                {...field}
                                                                disabled={isLoading}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {instructionFields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeInstruction(index)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendInstruction("" as never)}
                                        disabled={isLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Instruction
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Submission Settings */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {getSubmissionIcon()}
                                        Submission Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="submission.type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Submission Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select submission type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {SUBMISSION_TYPES.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {submissionType === "file" && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="submission.allowedFormats"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Allowed File Formats</FormLabel>
                                                        <div className="flex flex-wrap gap-2">
                                                            {ALLOWED_FORMATS.map((format) => {
                                                                const isSelected = field.value?.includes(format.value);
                                                                return (
                                                                    <Badge
                                                                        key={format.value}
                                                                        variant={isSelected ? "default" : "outline"}
                                                                        className={cn(
                                                                            "cursor-pointer transition-colors",
                                                                            isSelected && "bg-primary"
                                                                        )}
                                                                        onClick={() => {
                                                                            if (isLoading) return;
                                                                            const current = field.value || [];
                                                                            if (isSelected) {
                                                                                field.onChange(current.filter(f => f !== format.value));
                                                                            } else {
                                                                                field.onChange([...current, format.value]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {format.label}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                        <FormDescription>
                                                            Click to toggle allowed formats
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="submission.maxFileSizeMB"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Max File Size (MB)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={100}
                                                                {...field}
                                                                onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                                                                disabled={isLoading}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Maximum file size allowed (1-100 MB)
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {submissionType === "text" && (
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                Students will submit their response as text/essay through a text editor.
                                            </p>
                                        </div>
                                    )}

                                    {submissionType === "link" && (
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                Students will submit a URL link to their work (e.g., GitHub, portfolio, etc.)
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEditing ? "Update Assignment" : "Create Assignment"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}

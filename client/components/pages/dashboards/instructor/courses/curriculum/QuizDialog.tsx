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
import { Label } from "@/components/ui/label";
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Loader2,
    Plus,
    Trash2,
    CheckCircle,
    GripVertical,
    HelpCircle,
    AlertCircle,
} from "lucide-react";

import { useCreateQuiz, useUpdateQuiz } from "@/services/assessments";
import { IQuiz } from "@/services/assessments/types";

// Schema for quiz form
const quizFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    passingMarks: z.number().min(0),
    timeLimit: z.number().min(0).optional(),
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
    showCorrectAnswers: z.boolean(),
    maxAttempts: z.number().min(1),
    questions: z.array(z.object({
        question: z.string().min(1, "Question is required"),
        options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options required"),
        correctAnswerIndex: z.number().min(0),
        marks: z.number().min(1),
        explanation: z.string().optional(),
    })).min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface QuizDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    lessonId: string;
    contentId: string;
    existingQuiz?: IQuiz | null;
}

export function QuizDialog({
    open,
    onOpenChange,
    courseId,
    lessonId,
    contentId,
    existingQuiz,
}: QuizDialogProps) {
    const createQuiz = useCreateQuiz();
    const updateQuiz = useUpdateQuiz(existingQuiz?._id || "");
    const isEditing = !!existingQuiz;

    const getDefaultValues = (quiz?: IQuiz | null): QuizFormValues => {
        if (quiz) {
            return {
                title: quiz.title,
                description: quiz.description || "",
                passingMarks: quiz.passingMarks ?? 0,
                timeLimit: quiz.timeLimit || undefined,
                shuffleQuestions: quiz.shuffleQuestions,
                shuffleOptions: quiz.shuffleOptions,
                showCorrectAnswers: quiz.showCorrectAnswers,
                maxAttempts: quiz.maxAttempts,
                questions: quiz.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswerIndex: q.correctAnswerIndex,
                    marks: q.marks,
                    explanation: q.explanation || "",
                })),
            };
        }
        return {
            title: "",
            description: "",
            passingMarks: 0,
            timeLimit: undefined,
            shuffleQuestions: false,
            shuffleOptions: false,
            showCorrectAnswers: true,
            maxAttempts: 1,
            questions: [{
                question: "",
                options: ["", ""],
                correctAnswerIndex: 0,
                marks: 1,
                explanation: "",
            }],
        };
    };

    const form = useForm<QuizFormValues>({
        resolver: zodResolver(quizFormSchema),
        defaultValues: getDefaultValues(existingQuiz),
    });

    // Reset form when existingQuiz changes (important for showing existing questions)
    useEffect(() => {
        if (open) {
            form.reset(getDefaultValues(existingQuiz));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingQuiz, open]);

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const isLoading = createQuiz.isPending || updateQuiz.isPending;
    const createError = createQuiz.error;
    const updateError = updateQuiz.error;
    const error = createError || updateError;
    const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (error as { message?: string })?.message;

    const handleClose = () => {
        form.reset();
        createQuiz.reset();
        updateQuiz.reset();
        onOpenChange(false);
    };

    const onSubmit = async (values: QuizFormValues) => {
        try {
            if (isEditing) {
                await updateQuiz.mutateAsync({
                    title: values.title,
                    description: values.description,
                    passingMarks: values.passingMarks,
                    timeLimit: values.timeLimit,
                    shuffleQuestions: values.shuffleQuestions,
                    shuffleOptions: values.shuffleOptions,
                    showCorrectAnswers: values.showCorrectAnswers,
                    maxAttempts: values.maxAttempts,
                    questions: values.questions,
                });
            } else {
                await createQuiz.mutateAsync({
                    courseId,
                    lessonId,
                    contentId,
                    title: values.title,
                    description: values.description,
                    passingMarks: values.passingMarks,
                    timeLimit: values.timeLimit,
                    shuffleQuestions: values.shuffleQuestions,
                    shuffleOptions: values.shuffleOptions,
                    showCorrectAnswers: values.showCorrectAnswers,
                    maxAttempts: values.maxAttempts,
                    questions: values.questions,
                });
            }
            handleClose();
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    // Calculate total marks from questions
    const totalMarks = form.watch("questions")?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update quiz settings and questions"
                            : "Create a new quiz for this lesson content"}
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
                                    <CardTitle className="text-base">Quiz Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter quiz title" {...field} disabled={isLoading} />
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
                                                        placeholder="Brief description of the quiz"
                                                        {...field}
                                                        disabled={isLoading}
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="passingMarks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Passing Marks</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs">
                                                        Total: {totalMarks}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="timeLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Time Limit (min)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="No limit"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maxAttempts"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Attempts</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            {...field}
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                        <FormField
                                            control={form.control}
                                            name="shuffleQuestions"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="!mt-0">Shuffle Questions</FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="shuffleOptions"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="!mt-0">Shuffle Options</FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="showCorrectAnswers"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="!mt-0">Show Correct Answers</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Questions */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <HelpCircle className="h-4 w-4" />
                                            Questions ({questionFields.length})
                                        </CardTitle>
                                        <Badge variant="secondary">{totalMarks} marks total</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full">
                                        {questionFields.map((field, index) => (
                                            <AccordionItem key={field.id} value={`question-${index}`}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="flex items-center gap-2 text-left">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">Q{index + 1}.</span>
                                                        <span className="text-muted-foreground truncate max-w-[300px]">
                                                            {form.watch(`questions.${index}.question`) || "New Question"}
                                                        </span>
                                                        <Badge variant="outline" className="ml-2">
                                                            {form.watch(`questions.${index}.marks`)} marks
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-4">
                                                    <QuestionEditor
                                                        form={form}
                                                        index={index}
                                                        onRemove={() => removeQuestion(index)}
                                                        canRemove={questionFields.length > 1}
                                                        isLoading={isLoading}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full mt-4"
                                        onClick={() => appendQuestion({
                                            question: "",
                                            options: ["", ""],
                                            correctAnswerIndex: 0,
                                            marks: 1,
                                            explanation: "",
                                        })}
                                        disabled={isLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Question
                                    </Button>
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
                                    isEditing ? "Update Quiz" : "Create Quiz"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    );
}

// Question Editor Component
interface QuestionEditorProps {
    form: ReturnType<typeof useForm<QuizFormValues>>;
    index: number;
    onRemove: () => void;
    canRemove: boolean;
    isLoading: boolean;
}

function QuestionEditor({ form, index, onRemove, canRemove, isLoading }: QuestionEditorProps) {
    const options = form.watch(`questions.${index}.options`) || [];
    const correctIndex = form.watch(`questions.${index}.correctAnswerIndex`);

    const addOption = () => {
        const currentOptions = form.getValues(`questions.${index}.options`);
        form.setValue(`questions.${index}.options`, [...currentOptions, ""]);
    };

    const removeOption = (optIndex: number) => {
        const currentOptions = form.getValues(`questions.${index}.options`);
        if (currentOptions.length <= 2) return;

        const newOptions = currentOptions.filter((_, i) => i !== optIndex);
        form.setValue(`questions.${index}.options`, newOptions);

        // Adjust correctAnswerIndex if needed
        if (correctIndex >= newOptions.length) {
            form.setValue(`questions.${index}.correctAnswerIndex`, newOptions.length - 1);
        } else if (correctIndex > optIndex) {
            form.setValue(`questions.${index}.correctAnswerIndex`, correctIndex - 1);
        }
    };

    return (
        <div className="space-y-4 pl-6 border-l-2 border-muted">
            <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter your question"
                                {...field}
                                disabled={isLoading}
                                rows={2}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-2">
                <Label>Options (click checkmark to set correct answer)</Label>
                {options.map((_, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => form.setValue(`questions.${index}.correctAnswerIndex`, optIndex)}
                            className={`p-1 rounded transition-colors ${correctIndex === optIndex
                                ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            disabled={isLoading}
                        >
                            <CheckCircle className="h-5 w-5" />
                        </button>
                        <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={form.watch(`questions.${index}.options.${optIndex}`)}
                            onChange={(e) => {
                                const newOptions = [...form.getValues(`questions.${index}.options`)];
                                newOptions[optIndex] = e.target.value;
                                form.setValue(`questions.${index}.options`, newOptions);
                            }}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        {options.length > 2 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(optIndex)}
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
                    onClick={addOption}
                    disabled={isLoading || options.length >= 6}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name={`questions.${index}.marks`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Marks</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`questions.${index}.explanation`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Explanation (optional)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Why this is correct"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {canRemove && (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                    disabled={isLoading}
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Question
                </Button>
            )}
        </div>
    );
}

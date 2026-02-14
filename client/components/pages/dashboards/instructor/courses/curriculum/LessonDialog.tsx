"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lessonSchema, LessonFormValues } from "@/validators/lessonSchema";
import {
  getTodayNoon,
  getTomorrowNoon,
  toDateTimeLocal,
} from "@/lib/date-utils";

interface LessonDialogProps {
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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function LessonDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "create",
}: LessonDialogProps) {
  const [errorAlertOpen, setErrorAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      penaltyPercent: 0,
    },
  });

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (mode === "create") {
        // Default Dates: Today 12:00 PM and Tomorrow 12:00 PM
        form.reset({
          title: "",
          description: "",
          startDate: toDateTimeLocal(getTodayNoon().toISOString()),
          dueDate: toDateTimeLocal(getTomorrowNoon().toISOString()),
          penaltyPercent: 0,
        });
      } else if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description || "",
          startDate: toDateTimeLocal(initialData.deadline?.startDate),
          dueDate: toDateTimeLocal(initialData.deadline?.dueDate),
          penaltyPercent: initialData.deadline?.penaltyPercent || 0,
        });
      }
    }
  }, [open, mode, initialData, form]);

  const onFormSubmit = (data: LessonFormValues) => {
    onSubmit({
      title: data.title,
      description: data.description || undefined,
      deadline: {
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : undefined,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
        penaltyPercent: data.penaltyPercent,
      },
    });
  };

  const onError = (errors: any) => {
    // Collect error messages to show in Alert Dialog
    const messages: string[] = [];
    if (errors.title) messages.push(`Title: ${errors.title.message}`);
    if (errors.startDate)
      messages.push(`Start Date: ${errors.startDate.message}`);
    if (errors.dueDate) messages.push(`Due Date: ${errors.dueDate.message}`);
    if (errors.penaltyPercent)
      messages.push(`Penalty: ${errors.penaltyPercent.message}`);

    // Global/Root errors from refine (like date logic)
    if (errors.root) messages.push(errors.root.message);
    if (errors[""]) messages.push(errors[""]?.message); // sometimes root errors come here

    // If we have strict logic errors that prevented submit, show them
    if (messages.length > 0) {
      setErrorMessage(messages.join("\n"));
      setErrorAlertOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New Lesson" : "Edit Lesson"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new lesson within this section."
                : "Update the lesson details."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit, onError)}>
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Getting Started with Basics"
                          disabled={isLoading}
                          {...field}
                        />
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
                      <FormLabel>
                        Description{" "}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description..."
                          disabled={isLoading}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deadline & Penalty */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unlock Date (Start)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="penaltyPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penalty Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Applied if submitted after due date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                      ? "Create Lesson"
                      : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Error Alert Dialog */}
      <AlertDialog open={errorAlertOpen} onOpenChange={setErrorAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Validation Error
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorAlertOpen(false)}>
              OK, I'll fix it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

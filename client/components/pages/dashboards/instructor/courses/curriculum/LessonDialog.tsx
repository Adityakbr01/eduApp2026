"use client";

import { useState } from "react";

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

interface LessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { title: string; description?: string }) => void;
    isLoading?: boolean;
    initialData?: { title: string; description?: string };
    mode?: "create" | "edit";
}

export function LessonDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    initialData = { title: "", description: "" },
    mode = "create",
}: LessonDialogProps) {
    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description || "");

    // Reset form when dialog opens in create mode
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && mode === "create") {
            setTitle("");
            setDescription("");
        } else if (isOpen && mode === "edit") {
            setTitle(initialData.title);
            setDescription(initialData.description || "");
        }
        onOpenChange(isOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
            });
        }
    };

    return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
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
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="lesson-title">Lesson Title</Label>
                        <Input
                            id="lesson-title"
                            placeholder="e.g., Getting Started with Basics"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lesson-description">
                            Description <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="lesson-description"
                            placeholder="Brief description of what this lesson covers..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || !title.trim()}>
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
        </DialogContent>
    </Dialog>
);
}

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

interface SectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title: string) => void;
    isLoading?: boolean;
    initialTitle?: string;
    mode?: "create" | "edit";
}

export function SectionDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    initialTitle = "",
    mode = "create",
}: SectionDialogProps) {
    const [title, setTitle] = useState(initialTitle);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit(title.trim());
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setTitle(initialTitle);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Add New Section" : "Edit Section"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Create a new section to organize your course content."
                            : "Update the section title."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Section Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Introduction to the Course"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
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
                                    ? "Create Section"
                                    : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

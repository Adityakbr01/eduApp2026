"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateCourseInput } from "@/validators/course.schema";
import { X } from "lucide-react";
import { FC, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface TagsSectionProps {
  form: UseFormReturn<CreateCourseInput>;
}

export const TagsSection: FC<TagsSectionProps> = ({ form }) => {
  const [tagInput, setTagInput] = useState("");

  const tags = form.watch("tags") || [];

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }

    const newTags = [...tags, trimmed].slice(0, 10);
    form.setValue("tags", newTags, { shouldValidate: true });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    );
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={() => (
        <FormItem>
          <FormLabel>Tags</FormLabel>

          {/* Tags preview */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="destructive"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>

          {/* Input + Button (NO FormControl wrapper needed) */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag}>
              Add
            </Button>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

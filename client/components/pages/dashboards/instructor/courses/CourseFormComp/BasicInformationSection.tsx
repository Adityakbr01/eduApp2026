"use client";

import { UseFormReturn } from "react-hook-form";

// UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Custom components & hooks
import { CreateCourseInput } from "@/validators/course.schema";



// ────────────────────────────────────────────────
// Basic Information Section
// ────────────────────────────────────────────────
export function BasicInformationSection({
  form,
}: {
  form: UseFormReturn<CreateCourseInput>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Complete Web Development Bootcamp"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief overview of the course (max 500 characters)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Appears on course cards and search results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed course description..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

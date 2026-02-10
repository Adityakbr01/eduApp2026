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

// Custom components & hooks
import { CreateCourseInput } from "@/validators/course.schema";

export function DurationSection({ form }: { form: UseFormReturn<CreateCourseInput> }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Course Duration</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="durationWeeks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (Weeks)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={520}
                  step={1}
                  placeholder="1"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>How many weeks to complete (1-520)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
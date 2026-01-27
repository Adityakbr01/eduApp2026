
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Custom components & hooks
import { CreateCourseInput } from "@/validators/course.schema";


export function PricingSection({ form }: { form: UseFormReturn<CreateCourseInput> }) {
  const isFree = form.watch("pricing.isFree");
  const originalPrice = form.watch("pricing.originalPrice") ?? 0;
  const discountPercentage = form.watch("pricing.discountPercentage") ?? 0;
  const discountExpiresAt = form.watch("pricing.discountExpiresAt");
  const currency = form.watch("pricing.currency") ?? "USD";

  const isDiscountActive =
    discountPercentage > 0 &&
    (!discountExpiresAt || new Date(discountExpiresAt) > new Date());

  const finalPrice = isDiscountActive
    ? Math.round(
        (originalPrice - (originalPrice * discountPercentage) / 100) * 100
      ) / 100
    : originalPrice;

  const savings = originalPrice - finalPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="pricing.isFree"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Free Course</FormLabel>
                <FormDescription>Make this course free for all</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {!isFree && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricing.originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Base price of the course</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricing.discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>0-100%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricing.discountExpiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Expires On</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Leave empty for no expiry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Final Price (Auto-calculated)
                </span>
                <span className="text-xl font-bold text-primary">
                  {currency} {finalPrice.toFixed(2)}
                </span>
              </div>

              {isDiscountActive && savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="text-green-600 font-medium">
                    {currency} {savings.toFixed(2)} ({discountPercentage}% off)
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

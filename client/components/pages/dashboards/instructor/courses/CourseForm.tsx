"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import { createCourseSchema, CreateCourseInput } from "@/validators/course.schema";
import { useCreateCourse, useUpdateCourse, CourseLevel, DeliveryMode, Language, ICourse } from "@/services/courses";
import { useGetCategoriesWithSubcategories } from "@/services/categories";
import { S3Uploader } from "@/lib/s3/S3Uploader";
import { FileType } from "@/services/uploads";

interface CourseFormProps {
    initialData?: ICourse;
    isEditing?: boolean;
}

// Helper to extract ID from category/subCategory (can be string or object)
const getCategoryId = (category: string | { _id: string } | undefined): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category._id;
};

export function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
    const router = useRouter();
    const createCourse = useCreateCourse();
    const updateCourse = useUpdateCourse();
    const { data: categoriesData } = useGetCategoriesWithSubcategories();

    const initialCategoryId = getCategoryId(initialData?.category);
    const initialSubCategoryId = getCategoryId(initialData?.subCategory);

    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
    const [coverImagePublicId, setCoverImagePublicId] = useState<string>("");

    const categories = categoriesData?.data?.categories || [];

    // Transform pricing for form default values
    const getDefaultPricing = () => {
        if (initialData?.pricing) {
            return {
                price: initialData.pricing.price,
                originalPrice: initialData.pricing.originalPrice || 0,
                discountPercentage: initialData.pricing.discountPercentage || 0,
                discountExpiresAt: initialData.pricing.discountExpiresAt
                    ? new Date(initialData.pricing.discountExpiresAt).toISOString().split('T')[0]
                    : "",
                currency: (initialData.pricing.currency as "USD" | "EUR" | "INR") || "USD",
                isFree: initialData.pricing.isFree,
            };
        }
        return {
            price: 0,
            originalPrice: 0,
            discountPercentage: 0,
            discountExpiresAt: "",
            currency: "USD" as const,
            isFree: true,
        };
    };

    const form = useForm({
        resolver: zodResolver(createCourseSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            shortDescription: initialData?.shortDescription || "",
            category: initialCategoryId,
            subCategory: initialSubCategoryId,
            level: (initialData?.level as CourseLevel) || CourseLevel.BEGINNER,
            language: (initialData?.language as Language) || Language.ENGLISH,
            deliveryMode: (initialData?.deliveryMode as DeliveryMode) || DeliveryMode.RECORDED,
            coverImage: initialData?.coverImage || "",
            tags: initialData?.tags || [],
            pricing: getDefaultPricing(),
            durationWeeks: initialData?.durationWeeks || 1,
        },
    });

    // Get subcategories for selected category
    const selectedCategoryData = categories.find((cat: { _id: string }) => cat._id === selectedCategory);
    const subcategories = selectedCategoryData?.subcategories || [];

    // Update selectedCategory when form category changes
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "category" && value.category) {
                setSelectedCategory(value.category);
                form.setValue("subCategory", "");
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: unknown) => {
        const courseData = data as CreateCourseInput;
        try {
            if (isEditing && initialData) {
                await updateCourse.mutateAsync({
                    id: initialData._id,
                    data: courseData,
                });
                router.push("/dashboard/Instructor");

            } else {
                const result = await createCourse.mutateAsync(courseData);
                if (result.data?._id) {
                    router.push(`/dashboard/Instructor/courses/${result.data._id}/curriculum`);
                } else {
                    router.push("/dashboard/Instructor");
                }
            }
        } catch (error) {
            console.error("Error saving course:", error);
        }
    };

    const isLoading = createCourse.isPending || updateCourse.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/Instructor">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isEditing ? "Edit Course" : "Create New Course"}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEditing
                                    ? "Update your course details"
                                    : "Fill in the details to create a new course"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isEditing && (
                            <Link href={`/dashboard/Instructor/courses/${initialData?._id}/curriculum`} className="flex items-center gap-2 border border-t border-b-amber-300 px-4 py-1 rounded-md text-amber-600 hover:bg-amber-50 transition-all ">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Curriculum
                            </Link>
                        )}
                        <Button type="submit" disabled={isLoading} className="cursor-pointer">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isEditing ? "Update Course" : "Create Course"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
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

                        {/* Category & Level */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category & Level</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat: { _id: string; name: string }) => (
                                                            <SelectItem key={cat._id} value={cat._id}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub Category *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={!selectedCategory}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select subcategory" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subcategories.map((sub: { _id: string; name: string }) => (
                                                            <SelectItem key={sub._id} value={sub._id}>
                                                                {sub.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Level</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(CourseLevel).map((level) => (
                                                            <SelectItem key={level} value={level}>
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="language"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Language</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select language" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(Language).map((lang) => (
                                                            <SelectItem key={lang} value={lang}>
                                                                {lang}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="deliveryMode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Delivery Mode</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select mode" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(DeliveryMode).map((mode) => (
                                                            <SelectItem key={mode} value={mode}>
                                                                {mode}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Cover Image */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cover Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="coverImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <S3Uploader
                                                    initialValue={field.value}
                                                    uploadType={FileType.IMAGE}
                                                    multiple={false}
                                                    getKey={(file) => `Course/${initialData?._id || "new"}/cover-${Date.now()}.${file.name.split('.').pop()}`}
                                                    maxFiles={1}
                                                    maxFileSizeMB={5}
                                                    accept={{ "image/*": [] }}
                                                    autoUpload={true}
                                                    parallelUploads={1}
                                                    onUploaded={(keys) => {
                                                        if (keys[0]) {
                                                            field.onChange(keys[0]); // ✅ store S3 key in form
                                                        }
                                                    }}
                                                />
                                            </FormControl>

                                            <FormDescription>
                                                Recommended: 1280×720 (JPG/PNG/WebP, max 5MB)
                                            </FormDescription>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>

                        {/* Pricing */}
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
                                                <FormDescription>
                                                    Make this course free for all
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {!form.watch("pricing.isFree") && (
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
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Base price of the course
                                                        </FormDescription>
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
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
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
                                                                placeholder="0"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            0-100%
                                                        </FormDescription>
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
                                                            <Input
                                                                type="date"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave empty for no expiry
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Calculated Price Display */}
                                        {(() => {
                                            const originalPrice = form.watch("pricing.originalPrice") || 0;
                                            const discountPercentage = form.watch("pricing.discountPercentage") || 0;
                                            const discountExpiresAt = form.watch("pricing.discountExpiresAt");
                                            const currency = form.watch("pricing.currency") || "USD";

                                            const isDiscountActive = discountPercentage > 0 &&
                                                (!discountExpiresAt || new Date(discountExpiresAt) > new Date());

                                            const finalPrice = isDiscountActive
                                                ? Math.round((originalPrice - (originalPrice * discountPercentage / 100)) * 100) / 100
                                                : originalPrice;

                                            const savings = originalPrice - finalPrice;

                                            return (
                                                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Final Price (Auto-calculated)</span>
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
                                            );
                                        })()}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Course Duration */}
                        <Card>
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
                                                    placeholder="1"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                How many weeks to complete (1-520)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}

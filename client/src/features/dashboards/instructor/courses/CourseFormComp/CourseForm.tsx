"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import CourseImageUploader from "@/app/(routes)/dashboard/Instructor/courses/create/CourseImageUploader";
import getCategoryId from "@/lib/utils/getCategoryId";
import getDefaultPricing from "@/lib/utils/getDefaultPricing";
import { useGetCategoriesWithSubcategories } from "@/services/categories";
import {
  BatchStatus,
  CourseLevel,
  DeliveryMode,
  ICourse,
  Language,
  SocialLinkType,
  useCreateCourse,
  useUpdateCourse,
} from "@/services/courses";
import {
  CreateCourseInput,
  createCourseSchema,
} from "@/validators/course.schema";
import { BasicInformationSection } from "./BasicInformationSection";
import { CategoryAndLevelSection } from "./CategoryAndLevelSection";
import { CourseHeader } from "./CourseHeader";
import { DurationSection } from "./DurationSection";
import { PricingSection } from "./PricingSection";
import { TagsSection } from "./TagsSection";
import { BatchInformationSection } from "./BatchInformationSection";
import { SocialLinksSection } from "./SocialLinksSection";

interface CourseFormProps {
  initialData?: ICourse;
  isEditing?: boolean;
}

export function CourseForm({
  initialData,
  isEditing = false,
}: CourseFormProps) {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const { data: categoriesData } = useGetCategoriesWithSubcategories();

  const initialCategoryId = getCategoryId(initialData?.category);
  const initialSubCategoryId = getCategoryId(initialData?.subCategory);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategoryId);
  const categories = categoriesData?.data?.categories || [];

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
      deliveryMode:
        (initialData?.deliveryMode as DeliveryMode) || DeliveryMode.RECORDED,
      thumbnail: initialData?.thumbnail || undefined,
      tags: initialData?.tags || [],
      pricing: getDefaultPricing(initialData),
      durationWeeks: initialData?.durationWeeks || 1,
      batch: {
        startDate: initialData?.batch?.startDate || new Date().toISOString(),
        endDate: initialData?.batch?.endDate || new Date().toISOString(),
        batchStatus: initialData?.batch?.batchStatus || BatchStatus.UPCOMING,
      },
      mentorSupport: initialData?.mentorSupport || true,
      maxEnrollments: initialData?.maxEnrollments || 50,
      isFeatured: initialData?.isFeatured || false,
      socialLinks: (initialData?.socialLinks || []).map((link) => ({
        type: link.type as SocialLinkType,
        url: link.url,
        isPublic: link.isPublic,
      })),
    },
  });

  // Get subcategories for selected category
  const selectedCategoryData = categories.find(
    (cat: { _id: string }) => cat._id === selectedCategory,
  );
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
      console.log("Submitting course data:", courseData);
      if (isEditing && initialData) {
        await updateCourse.mutateAsync({
          id: initialData._id,
          data: courseData,
        });
        router.push("/dashboard/Instructor");
      } else {
        const result = await createCourse.mutateAsync({
          ...courseData,
        });

        if (result.data?._id) {
          router.push(
            `/dashboard/Instructor/courses/${result.data._id}/curriculum`,
          );
        }
      }
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const isLoading = createCourse.isPending || updateCourse.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <CourseHeader
          isEditing={isEditing}
          courseId={initialData?._id}
          isLoading={isLoading}
          isUploadingThumbnail={false}
        />

        {/* ─── Row 1: Main Content + Sidebar ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Core Info (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInformationSection
              form={form as UseFormReturn<CreateCourseInput>}
            />
            <TagsSection form={form as UseFormReturn<CreateCourseInput>} />
            <CategoryAndLevelSection
              form={form as UseFormReturn<CreateCourseInput>}
              categories={categories}
              subcategories={subcategories}
            />
          </div>

          {/* Right: Sidebar (1/3) */}
          <div className="space-y-6">
            {isEditing && initialData?._id && (
              <Card>
                <CardHeader>
                  <CardTitle>Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CourseImageUploader
                            courseId={initialData._id}
                            value={field.value}
                            onChange={(thumbnail) => {
                              console.log("Thumbnail changed:", thumbnail);
                              field.onChange(thumbnail);
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
            )}
            <PricingSection form={form as UseFormReturn<CreateCourseInput>} />
          </div>
        </div>

        {/* ─── Row 2: Duration + Batch (side by side) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DurationSection form={form as UseFormReturn<CreateCourseInput>} />
          <BatchInformationSection
            form={form as UseFormReturn<CreateCourseInput>}
          />
        </div>

        {/* ─── Row 3: Social Links (full width) ─── */}
        <SocialLinksSection form={form as UseFormReturn<CreateCourseInput>} />
      </form>
    </Form>
  );
}

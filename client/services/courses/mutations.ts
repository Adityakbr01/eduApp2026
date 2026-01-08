import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCourseApi, courseApi } from "./api";
import {
    CreateCourseDTO,
    UpdateCourseDTO,
    CreateSectionDTO,
    UpdateSectionDTO,
    CreateLessonDTO,
    UpdateLessonDTO,
    CreateContentDTO,
    UpdateContentDTO,
    ReorderItemDTO,
    CourseStatus,
} from "./types";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";

// ==================== COURSE MUTATIONS ====================

/**
 * Create a new course
 */
export const useCreateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCourseDTO) => courseApi.createCourse(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Course created successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update a course
 */
export const useUpdateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCourseDTO }) =>
            courseApi.updateCourse(id, data),
        onSuccess: (response, { id }) => {
            mutationHandlers.success(response.message || "Course updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.DETAIL(id)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Delete a course
 */
export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => courseApi.deleteCourse(id),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Course deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Publish/unpublish a course
 */
export const useSubmitCourseRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { id: string; status: CourseStatus.PUBLISHED | CourseStatus.UNPUBLISHED }) =>
            courseApi.toggleCourseStatus(data),
        onSuccess: (response, data) => {
            mutationHandlers.success(response.message || "Course Status change submitted, wait for review");
           queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES.INSTRUCTOR_COURSES], }); 
           queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES.DETAIL(data.id)], });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

export const useAdminReviewCourseRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { requestId: string, action: CourseStatus.APPROVED | CourseStatus.REJECTED; reason?: string }) =>
            adminCourseApi.toggleCourseStatusAdmin(data),
        onSuccess: (response) => {
            mutationHandlers.success(response.message || "Course status request reviewed successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.ADMIN_ALL],
            });
        }
        ,
        onError: (error) => mutationHandlers.error(error),
    });
};




// ==================== SECTION MUTATIONS ====================

/**
 * Create a section
 */
export const useCreateSection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, data }: { courseId: string; data: CreateSectionDTO }) =>
            courseApi.createSection(courseId, data),
        onSuccess: (response, { courseId }) => {
            mutationHandlers.success(response.message || "Section created successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update a section
 */
export const useUpdateSection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            sectionId,
            data,
        }: {
            sectionId: string;
            data: UpdateSectionDTO;
            courseId: string;
        }) => courseApi.updateSection(sectionId, data),
        onSuccess: (response, { courseId }) => {
            mutationHandlers.success(response.message || "Section updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Delete a section
 */
export const useDeleteSection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId }: { sectionId: string; courseId: string }) =>
            courseApi.deleteSection(sectionId),
        onSuccess: (response, { courseId }) => {
            mutationHandlers.success(response.message || "Section deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Toggle section visibility
 */
export const useToggleSectionVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId }: { sectionId: string; courseId: string }) =>
            courseApi.toggleSectionVisibility(sectionId),
        onSuccess: (response, { courseId }) => {
            mutationHandlers.success(response.message || "Section visibility updated");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Reorder sections
 */
export const useReorderSections = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, items }: { courseId: string; items: ReorderItemDTO[] }) =>
            courseApi.reorderSections(courseId, items),
        onSuccess: (response, { courseId }) => {
            mutationHandlers.success(response.message || "Sections reordered successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.SECTIONS(courseId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

// ==================== LESSON MUTATIONS ====================

/**
 * Create a lesson
 */
export const useCreateLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId, data }: { sectionId: string; data: CreateLessonDTO }) =>
            courseApi.createLesson(sectionId, data),
        onSuccess: (response, { sectionId }) => {
            mutationHandlers.success(response.message || "Lesson created successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update a lesson
 */
export const useUpdateLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            lessonId,
            data,
        }: {
            lessonId: string;
            data: UpdateLessonDTO;
            sectionId: string;
        }) => courseApi.updateLesson(lessonId, data),
        onSuccess: (response, { sectionId }) => {
            mutationHandlers.success(response.message || "Lesson updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Delete a lesson
 */
export const useDeleteLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId }: { lessonId: string; sectionId: string }) =>
            courseApi.deleteLesson(lessonId),
        onSuccess: (response, { sectionId }) => {
            mutationHandlers.success(response.message || "Lesson deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Toggle lesson visibility
 */
export const useToggleLessonVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId }: { lessonId: string; sectionId: string }) =>
            courseApi.toggleLessonVisibility(lessonId),
        onSuccess: (response, { sectionId }) => {
            mutationHandlers.success(response.message || "Lesson visibility updated");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Reorder lessons
 */
export const useReorderLessons = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sectionId, items }: { sectionId: string; items: ReorderItemDTO[] }) =>
            courseApi.reorderLessons(sectionId, items),
        onSuccess: (response, { sectionId }) => {
            mutationHandlers.success(response.message || "Lessons reordered successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.LESSONS(sectionId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

// ==================== CONTENT MUTATIONS ====================

/**
 * Create content in a lesson
 */
export const useCreateContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, data }: { lessonId: string; data: CreateContentDTO }) =>
            courseApi.createContent(lessonId, data),
        onSuccess: (response, { lessonId }) => {
            mutationHandlers.success(response.message || "Content created successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Update content
 */
export const useUpdateContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            contentId,
            data,
        }: {
            contentId: string;
            data: UpdateContentDTO;
            lessonId: string;
        }) => courseApi.updateContent(contentId, data),
        onSuccess: (response, { lessonId }) => {
            mutationHandlers.success(response.message || "Content updated successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Delete content
 */
export const useDeleteContent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId }: { contentId: string; lessonId: string }) =>
            courseApi.deleteContent(contentId),
        onSuccess: (response, { lessonId }) => {
            mutationHandlers.success(response.message || "Content deleted successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Toggle content visibility
 */
export const useToggleContentVisibility = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contentId }: { contentId: string; lessonId: string }) =>
            courseApi.toggleContentVisibility(contentId),
        onSuccess: (response, { lessonId }) => {
            mutationHandlers.success(response.message || "Content visibility updated");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

/**
 * Reorder contents
 */
export const useReorderContents = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ lessonId, items }: { lessonId: string; items: ReorderItemDTO[] }) =>
            courseApi.reorderContents(lessonId, items),
        onSuccess: (response, { lessonId }) => {
            mutationHandlers.success(response.message || "Contents reordered successfully");
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.COURSES.CONTENTS(lessonId)],
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

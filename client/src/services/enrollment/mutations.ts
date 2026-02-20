import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentApi } from "./api";
import { mutationHandlers } from "@/services/common/mutation-utils";
import { QUERY_KEYS } from "@/config/query-keys";

// ==================== ENROLLMENT MUTATIONS ====================

/**
 * Enroll in a free course
 */
export const useEnrollInFreeCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseId: string) => enrollmentApi.enrollInCourse(courseId),
        onSuccess: (response, courseId) => {
            mutationHandlers.success(response.message || "Successfully enrolled in the course!");
            // Invalidate enrollment status and my courses
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ENROLLMENT.STATUS(courseId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.ENROLLMENT.MY_COURSES,
            });
        },
        onError: (error) => mutationHandlers.error(error),
    });
};

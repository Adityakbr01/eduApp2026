import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { enrollmentApi } from "./api";
import { EnrollmentStatus } from "./types";

// ==================== ENROLLMENT QUERIES ====================

/**
 * Get user's enrolled courses
 */
export const useGetMyEnrolledCourses = (params?: {
    page?: number;
    limit?: number;
    status?: EnrollmentStatus;
}) => {
    return useQuery({
        queryKey: params?.page
            ? QUERY_KEYS.ENROLLMENT.MY_COURSES_PAGINATED(params.page)
            : QUERY_KEYS.ENROLLMENT.MY_COURSES,
        queryFn: () => enrollmentApi.getMyEnrolledCourses(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

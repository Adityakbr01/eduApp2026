import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query-keys";
import { classroomApi } from "./api";

// ==================== CLASSROOM QUERIES ====================

/**
 * Get classroom data (enrolled courses with progress)
 */
export const useGetClassroomData = () => {
    return useQuery({
        queryKey: QUERY_KEYS.CLASSROOM.DATA,
        queryFn: () => classroomApi.getClassroomData(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

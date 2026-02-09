import { useQuery } from "@tanstack/react-query";
import { preferenceApi } from "./api";
import { QUERY_KEYS } from "@/config/query-keys";

/**
 * Get user preferences
 */
export const useGetPreferences = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PREFERENCES, userId],
        queryFn: () => preferenceApi.getPreferences(),
        enabled: !!userId,
    });
};

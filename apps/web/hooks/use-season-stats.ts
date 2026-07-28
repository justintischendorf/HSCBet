import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const seasonStatsQueryKey = ["season-stats"];
export const seasonStatsQueryFn = () => apiClient.api.season.stats.get();

export function useSeasonStats() {
  return useQuery({
    queryKey: seasonStatsQueryKey,
    queryFn: seasonStatsQueryFn,
  });
}

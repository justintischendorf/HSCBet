import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const seasonsQueryKey = ["seasons"];
export const seasonsQueryFn = () => apiClient.api.season.get();

export function useSeasons() {
  return useQuery({
    queryKey: seasonsQueryKey,
    queryFn: seasonsQueryFn,
  });
}

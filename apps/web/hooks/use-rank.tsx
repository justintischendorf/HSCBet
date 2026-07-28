import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const rankQueryKey = ["rank"];
export const rankQueryFn = () => apiClient.api.rank.get();

export function useRank() {
  return useQuery({
    queryKey: rankQueryKey,
    queryFn: rankQueryFn,
  });
}

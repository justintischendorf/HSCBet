import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const rankQueryKey = ["rank"];
export const rankQueryFn = () => apiClient.api.rank.get();

export function useRank() {
  return useQuery({
    queryKey: rankQueryKey,
    queryFn: rankQueryFn,
  });
}

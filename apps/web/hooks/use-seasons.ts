import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useSeasons() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: () => apiClient.api.season.get(),
  });
}

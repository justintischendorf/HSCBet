import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => apiClient.api.group.get(),
  });
}

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const groupsQueryKey = ["groups"];
export const groupsQueryFn = () => apiClient.api.group.get();

export function useGroups() {
  return useQuery({
    queryKey: groupsQueryKey,
    queryFn: groupsQueryFn,
  });
}

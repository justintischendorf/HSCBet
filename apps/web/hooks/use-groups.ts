import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const groupsQueryKey = ["groups"];
export const groupsQueryFn = () => apiClient.api.group.get();

export function useGroups() {
  return useQuery({
    queryKey: groupsQueryKey,
    queryFn: groupsQueryFn,
  });
}

import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const groupQueryKey = (groupId: string) => ["groups", groupId];
export const groupQueryFn = (groupId: string) => () =>
  apiClient.api.group({ id: groupId }).get();

export function useGroupById(groupId: string) {
  return useQuery({
    queryKey: groupQueryKey(groupId),
    queryFn: groupQueryFn(groupId),
    enabled: !!groupId,
  });
}

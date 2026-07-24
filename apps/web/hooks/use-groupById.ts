import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const groupQueryKey = (groupId: string) => ["groups", groupId];
export const groupQueryFn = (groupId: string) => () =>
  apiClient.api.group({ id: groupId }).get();

export function useTips(seasonId: string) {
  return useQuery({
    queryKey: groupQueryKey(seasonId),
    queryFn: groupQueryFn(seasonId),
    enabled: !!seasonId,
  });
}

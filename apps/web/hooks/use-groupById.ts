import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

const groupQueryKey = (groupId: string) => ["groups", groupId];
const groupQueryFn = (groupId: string) => () =>
  apiClient.api.group({ id: groupId }).get();

export function useGroupById(groupId: string) {
  return useQuery({
    queryKey: groupQueryKey(groupId),
    queryFn: groupQueryFn(groupId),
    enabled: !!groupId,
  });
}

import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const tipsQueryKey = (seasonId: string) => ["tips", seasonId];
export const tipsQueryFn = (seasonId: string) => () =>
  apiClient.api.tip({ id: seasonId }).get();

export function useTips(seasonId: string) {
  return useQuery({
    queryKey: tipsQueryKey(seasonId),
    queryFn: tipsQueryFn(seasonId),
    enabled: !!seasonId,
  });
}

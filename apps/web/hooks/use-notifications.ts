import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export const notificationsQueryKey = ["notifications"];
export const notificationsQueryFn = () => apiClient.api.notification.get();

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationsQueryFn,
  });
}

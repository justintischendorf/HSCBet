import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const notificationsQueryKey = ["notifications"];
export const notificationsQueryFn = () => apiClient.api.notification.get();

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationsQueryFn,
  });
}

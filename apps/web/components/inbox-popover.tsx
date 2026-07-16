"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  notificationsQueryKey,
  useNotifications,
} from "@/hooks/use-notifications";

type Filter = "unread" | "read";

export function InboxPopover() {
  const { data: notificationsResponse, isPending } = useNotifications();
  const [filter, setFilter] = useState<Filter>("unread");

  useEffect(() => {
    if (notificationsResponse?.error) {
      toast.error(
        `${notificationsResponse.error.status}: ${notificationsResponse.error.value}`,
      );
    }
  }, [notificationsResponse?.error]);

  const notifications = notificationsResponse?.data?.notification ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : n.read,
  );

  async function handleMarkAsRead(notificationId: string) {
    const { error } = await apiClient.api
      .notification({ id: notificationId })
      .read.patch();

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  async function handleMarkAllAsRead() {
    const { error } = await apiClient.api.notification.readAll.patch();

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Inbox className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end">
        <div className="flex items-center justify-between">
          <PopoverTitle>Postfach</PopoverTitle>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Alle als gelesen markieren
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              filter === "unread"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Ungelesen{unreadCount > 0 && ` (${unreadCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter("read")}
            className={cn(
              "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              filter === "read"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Gelesen
          </button>
        </div>

        <div className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
          {isPending ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Lädt...
            </p>
          ) : filteredNotifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {filter === "unread"
                ? "Keine ungelesenen Nachrichten"
                : "Keine gelesenen Nachrichten"}
            </p>
          ) : (
            filteredNotifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60",
                  !n.read && "bg-muted/40",
                )}
              >
                <div className="flex w-full items-center gap-2">
                  {!n.read && (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                  <span
                    className={cn(
                      "flex-1 truncate text-sm",
                      !n.read
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {n.message}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  Uhr
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

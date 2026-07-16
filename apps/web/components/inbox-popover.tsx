"use client";

import { useEffect, useState } from "react";
import { Check, Inbox, Trash, Undo2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { ConfirmAlert } from "./confirm-alert";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import {
  notificationsQueryKey,
  useNotifications,
} from "@/hooks/use-notifications";
import { useMutation } from "@tanstack/react-query";

type Filter = "unread" | "read";

export function InboxPopover() {
  const { data: notificationsResponse, isPending } = useNotifications();
  const [filter, setFilter] = useState<Filter>("unread");
  const [showDeleteAllReadConfirm, setShowDeleteAllReadConfirm] =
    useState(false);

  useEffect(() => {
    if (notificationsResponse?.error) {
      toast.error(
        `${notificationsResponse.error.status}: ${notificationsResponse.error.value}`,
      );
    }
  }, [notificationsResponse?.error]);

  const notifications = notificationsResponse?.data?.notification ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : n.read,
  );

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient.api.notification({ id: notificationId }).read.patch();
    },
  });

  const { mutateAsync: markAllAsRead } = useMutation({
    mutationFn: async () => {
      return apiClient.api.notification.readAll.patch();
    },
  });

  const { mutateAsync: markAsUnread } = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiClient.api.notification({ id: notificationId }).unread.patch();
    },
  });

  async function handleMarkAsRead(notificationId: string) {
    const { error } = await markAsRead(notificationId);

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  async function handleMarkAllAsRead() {
    const { error } = await markAllAsRead();

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  async function handleMarkAsUnread(notificationId: string) {
    const { error } = await markAsUnread(notificationId);

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  async function handleDelete(notificationId: string) {
    const { error } = await apiClient.api
      .notification({ id: notificationId })
      .delete();

    if (error) {
      toast.error(`${error.status}: ${error.value}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
  }

  async function handleDeleteAllRead() {
    const { error } = await apiClient.api.notification.read.delete();

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
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-huk-accent px-1 text-[10px] font-medium text-black">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex h-112 w-96 flex-col p-3" align="end">
        <div className="flex shrink-0 items-start justify-between">
          <PopoverTitle>Postfach</PopoverTitle>
          <div className="flex flex-col items-end gap-0.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Alle als gelesen markieren
              </button>
            )}
            {readCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteAllReadConfirm(true)}
                className="text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                Alle gelesenen löschen
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-1 rounded-lg bg-muted p-1">
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

        <ScrollArea className="mt-3 min-h-0 flex-1">
          <div className="flex flex-col gap-1">
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
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60",
                    !n.read && "bg-muted/40",
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <div className="flex w-full items-center gap-2">
                      {!n.read && (
                        <span className="size-1.5 shrink-0 rounded-full bg-huk-accent" />
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
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                    {n.read ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Als ungelesen markieren"
                        onClick={() => handleMarkAsUnread(n.id)}
                      >
                        <Undo2 />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title="Als gelesen markieren"
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <Check />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      title="Löschen"
                      onClick={() => handleDelete(n.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
      <ConfirmAlert
        message="Alle gelesenen Benachrichtigungen werden dauerhaft gelöscht."
        open={showDeleteAllReadConfirm}
        onOpenChange={setShowDeleteAllReadConfirm}
        onConfirm={handleDeleteAllRead}
      />
    </Popover>
  );
}

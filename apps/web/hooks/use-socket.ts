import { useEffect, useRef, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { createLogger } from "@repo/logger";

import { notificationsQueryKey } from "./use-notifications";
import { rankQueryKey } from "./use-rank";
import { seasonStatsQueryKey } from "./use-season-stats";
import { seasonsQueryKey } from "./use-seasons";

const logger = createLogger("web:socket-hook");
const RECONNECT_DELAY_MS = 3000;

export function useSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  function createNotification(message: string) {
    return apiClient.api.notification.post({ message });
  }

  useEffect(() => {
    let isUnmounted = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      const wsUrl =
        process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/api/socket";

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleNotificationUpdate(message.payload, createNotification);
        } catch (err) {
          logger.error(
            "Fehler beim Verarbeiten der WebSocket-Nachricht:" + err,
          );
        }
      };

      socket.onerror = (error) => {
        if (isUnmounted) return;
        logger.error("WebSocket-Fehler:", error);
      };

      socket.onclose = () => {
        setIsConnected(false);

        if (isUnmounted) return;
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      wsRef.current = socket;
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      const socket = wsRef.current;
      if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING)
      ) {
        socket.close();
      }
    };
  }, []);

  return { isConnected };
}

interface eventTypes {
  eventType: "game_updated" | "seasons_updated" | "group_invited";
}

async function handleNotificationUpdate(
  payload: eventTypes,
  createNotification: (
    message: string,
  ) => ReturnType<(typeof apiClient)["api"]["notification"]["post"]>,
) {
  switch (payload?.eventType) {
    case "game_updated":
      await queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      await queryClient.invalidateQueries({ queryKey: rankQueryKey });
      await queryClient.invalidateQueries({ queryKey: seasonStatsQueryKey });
      await apiClient.api.rank["evaluate-points"].patch();
      await createNotification("Ein Spiel wurde aktualisiert.");
      break;
    case "seasons_updated":
      await createNotification("Die neue Saison ist verfügbar!");
      await queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
      break;
    case "group_invited":
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      break;
    default:
      logger.warn("Unbekannter Nachrichtentyp:", payload?.eventType);
  }
}

import { queryClient } from "@/lib/queryClient";
import { useEffect, useRef, useState } from "react";
import { seasonsQueryKey } from "./use-seasons";
import { createLogger } from "@repo/logger";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { notificationsQueryKey } from "./use-notifications";

const logger = createLogger("web:socket-hook");

export function useSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/api/socket";

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleNotificationUpdate(message.payload);
      } catch (err) {
        logger.error("Fehler beim Verarbeiten der WebSocket-Nachricht:" + err);
      }
    };

    socket.onerror = (error) => {
      logger.error("WebSocket-Fehler:", error);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = socket;

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, []);

  return { isConnected };
}

interface eventTypes {
  eventType: "game_updated" | "seasons_updated";
}

async function handleNotificationUpdate(payload: eventTypes) {
  switch (payload?.eventType) {
    case "game_updated":
      await apiClient.api.notification.post({
        message: "Ein Spiel wurde aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      break;
    case "seasons_updated":
      queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
      break;
    default:
      logger.warn("Unbekannter Nachrichtentyp:", payload?.eventType);
  }
}

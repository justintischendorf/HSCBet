import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
        switch (message.type) {
          case "game_updated":
            toast(message.payload.message);
            break;
          default:
            console.warn("Unbekannter Nachrichtentyp:", message.type);
        }
      } catch (err) {
        console.error("Fehler beim Verarbeiten der WebSocket-Nachricht:" + err);
      }
    };

    socket.onerror = (error) => {
      console.log("WebSocket-Fehler:", error);
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

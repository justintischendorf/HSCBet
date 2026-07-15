import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useSocket() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/api/socket";

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {};

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
      } catch (err) {
        toast.error("Fehler beim Verarbeiten der WebSocket-Nachricht:" + err);
      }
    };

    socket.onerror = (error) => {
      console.log("WebSocket-Fehler:", error);
    };

    socket.onclose = (event) => {};

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
}

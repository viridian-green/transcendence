import { useEffect, useRef, useState } from "react";

export function usePresenceSocket(enabled: boolean) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Adjust the path if your API gateway proxies /api/presence to the presence service
    const wsUrl = `${protocol}//${window.location.host}/api/presence`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = () => setIsConnected(false);

    return () => ws.current?.close();
  }, [enabled]);

  return { isConnected };
}

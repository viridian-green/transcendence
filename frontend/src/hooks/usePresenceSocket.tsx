// import { useEffect, useRef, useState } from 'react';

// export function usePresenceSocket(enabled: boolean) {
// 	const [isConnected, setIsConnected] = useState(false);
// 	const ws = useRef<WebSocket | null>(null);

// 	useEffect(() => {
// 		if (!enabled) return;
// 		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// 		// Adjust the path if your API gateway proxies /api/presence to the presence service
// 		const wsUrl = `${protocol}//${window.location.host}/api/presence`;
// 		ws.current = new WebSocket(wsUrl);

// 		ws.current.onopen = () => setIsConnected(true);
// 		ws.current.onclose = () => setIsConnected(false);
// 		ws.current.onerror = () => setIsConnected(false);

// 		return () => ws.current?.close();
// 	}, [enabled]);

// 	return { isConnected, ws };
// }

// hooks/usePresenceSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface PresenceMessage {
  type: string;
  userId: string;
  state: 'online' | 'offline' | 'busy';
}

interface FriendStatusMap {
  [userId: string]: 'online' | 'offline' | 'busy';
}

export function usePresenceSocket(enabled: boolean) {
  const [isConnected, setIsConnected] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState<FriendStatusMap>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/presence`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('[PRESENCE] Connected');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('[PRESENCE] Disconnected');
    };

    ws.current.onerror = () => {
      setIsConnected(false);
      console.log('[PRESENCE] Error');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: PresenceMessage = JSON.parse(event.data);

        if (message.type === 'userStateChanged') {
          setFriendStatuses(prev => ({
            ...prev,
            [message.userId]: message.state
          }));
          console.log(`[PRESENCE] ${message.userId} is now ${message.state}`);
        }

        if (message.type === 'state_updated') {
          console.log(`[PRESENCE] Own state: ${message.state}`);
        }

        if (message.type === 'onlineUsersUpdated') {
          console.log('[PRESENCE] Online users list updated');
        }
      } catch (err) {
        console.error('[PRESENCE] Message parse error:', err);
      }
    };

    return () => ws.current?.close();
  }, [enabled]);

  // Send manual state change (e.g., "Do Not Disturb" button)
  const sendStateChange = useCallback((state: 'online' | 'busy') => {
    ws.current?.send(JSON.stringify({
      type: 'state_change',
      state
    }));
  }, []);

  return {
    isConnected,
    ws,
    friendStatuses,    // ← NEW: Real-time status map
    sendStateChange    // ← NEW: Manual state control
  };
}

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatRenderMessage, NotificationFriendRequest, FriendRequest } from '@/components/chat/types/chat';

export function useNotificationSocket(enabled: boolean) {
  const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<Record<string, FriendRequest>>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    const fetchPendingRequests = async () => {
      try {
        const res = await fetch('/api/users/friends/pending', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const combined = [...(data.incoming || []), ...(data.outgoing || [])];
        setFriendRequests(prev => {
          const updated = { ...prev };
          for (const user of combined) {
            if (!user?.id) continue;
            updated[String(user.id)] = {
              fromUserId: String(user.id),
              fromUsername: user.username || '',
              status: 'pending',
            };
          }
          return updated;
        });
      } catch {
        // silently ignore
      }
    };

    fetchPendingRequests();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/notifications/websocket`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = (event) => {
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('[NOTIFICATION SOCKET] error', err);
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data: NotificationFriendRequest = JSON.parse(event.data);
        setLastRawMessage(data);
        switch (data.type) {
          case 'FRIEND_INVITE_RECEIVED':
            setFriendRequests(prev => ({
              ...prev,
              [String(data.fromUserId)]: {
                fromUserId: String(data.fromUserId),
                fromUsername: data.fromUsername,
                status: 'pending',
              },
            }));
            break;
          case 'FRIEND_INVITE_ACCEPTED':
            if (data.fromUserId) setFriendRequests(prev => ({
              ...prev,
              [String(data.fromUserId)]: {
                ...(prev[String(data.fromUserId)] || {}),
                fromUserId: String(data.fromUserId),
                fromUsername: data.fromUsername,
                status: 'accepted',
              },
            }));
            break;
          case 'FRIEND_INVITE_REJECTED':
            if (data.fromUserId) setFriendRequests(prev => ({
              ...prev,
              [String(data.fromUserId)]: {
                ...(prev[String(data.fromUserId)] || {}),
                fromUserId: String(data.fromUserId),
                fromUsername: data.fromUsername,
                status: 'rejected',
              },
            }));
            break;
          case 'FRIEND_DELETED':
            // Remove friend request state for the deleted friend (toUserId)
            if (data.toUserId) {
              setFriendRequests(prev => {
                const updated = { ...prev };
                delete updated[String(data.toUserId)];
                return updated;
              });
            }
            break;
          case 'FRIEND_UNFRIENDED':
            // Remove friend request state for the user who unfriended us (fromUserId)
            if (data.fromUserId) {
              setFriendRequests(prev => {
                const updated = { ...prev };
                delete updated[String(data.fromUserId)];
                return updated;
              });
            }
            break;
        }
      } catch (parseError) {
        console.error('[NOTIFICATION SOCKET] parse error:', parseError);
      }
    };

    return () => {
      isMounted = false;
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      ws.current = null;
    };
  }, [enabled]);

  const send = useCallback((payload: unknown) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('[NOTIFICATION SOCKET] cannot send, socket state:',
        ws.current?.readyState,
        'payload:', payload
      );
      return;
    }
    ws.current.send(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  }, []);

  return {
    messages,
    friendRequests,
    setFriendRequests,
    isConnected,
    send,
    lastRawMessage
  };

}
import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatRenderMessage, NotificationServerMessage, FriendRequest } from '@/components/chat/types/chat';

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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/notifications/websocket`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = (event) => {
      console.log('[NOTIFICATION SOCKET] closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        readyState: socket.readyState,
      });
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('[NOTIFICATION SOCKET] error', err);
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data: NotificationServerMessage = JSON.parse(event.data);
        setLastRawMessage(data);
        switch (data.type) {
          // case 'welcome':
          //   console.log('[NOTIFICATION SOCKET]', data.message);
          //   break;
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
        }
      } catch (parseError) {
        console.error('[NOTIFICATION SOCKET] parse error:', parseError);
      }
    };

    return () => {
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
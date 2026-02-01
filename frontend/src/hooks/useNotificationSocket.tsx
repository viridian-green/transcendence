import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '@/components/chat/types/chat';

export function useNotificationSocket(enabled: boolean) {
  const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      console.log('[NOTIFICATION SOCKET] disabled');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
     const wsUrl = `${protocol}//${window.location.host}/api/notifications/websocket`;
    console.log('[NOTIFICATION SOCKET] connecting to', wsUrl);

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('[NOTIFICATION SOCKET] connected');
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
      console.log('[NOTIFICATION SOCKET] raw message', event.data);
      try {
        const data: ChatServerMessage = JSON.parse(event.data);

        setLastRawMessage(data);
        switch (data.type) {
          case 'welcome':
            console.log('[NOTIFICATION SOCKET]', data.message);
            break;

        case 'FRIEND_INVITE_RECEIVED':
            console.log('[NOTIFICATION SOCKET] Friend invite received from', data.fromUsername);
            setFriendRequests(prev => [...prev, {
                fromUserId: data.fromUserId,
                fromUsername: data.fromUsername,
                timestamp: Date.now()
            }]);
            // You can also trigger a toast/notification UI here
            break;

        }
      } catch (parseError) {
        console.error('[NOTIFICATION SOCKET] parse error:', parseError);
      }
    };

    return () => {
      console.log('[NOTIFICATION SOCKET] cleanup (effect unmounting)');
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
    console.log('[NOTIFICATION SOCKET] sending', payload);
    ws.current.send(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  }, []);



  return {
  messages,
    isConnected,
    send,
    lastRawMessage
};

}


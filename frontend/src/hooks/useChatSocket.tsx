import { useEffect, useRef, useState } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '@/types/chat';

export function useChatSocket(enabled: boolean) {
  const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      console.log('[CHAT SOCKET] disabled');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const search = new URLSearchParams(window.location.search);
    const userParam = search.get('user') ?? 'alice';

    const wsUrl = `${protocol}//${window.location.host}/api/chat/websocket?user=${encodeURIComponent(userParam)}`;

    console.log('[CHAT SOCKET] connecting to', wsUrl);

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('[CHAT SOCKET] connected');
      setIsConnected(true);
    };

    socket.onclose = (event) => {
      console.log('[CHAT SOCKET] closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        readyState: socket.readyState,
      });
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('[CHAT SOCKET] error', err);
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      console.log('[CHAT SOCKET] raw message', event.data);
      try {
        const data: ChatServerMessage & { type: string } = JSON.parse(event.data);

        // expose raw data for other features (invites)
        setLastRawMessage(data);

        switch (data.type) {
          case 'message':
            setMessages((prev) => [
              ...prev,
              {
                kind: 'chat',
                username: data.user?.username ?? data.username ?? 'unknown',
                text: data.text,
              },
            ]);
            return;
          case 'welcome':
            setMessages((prev) => [
              ...prev,
              { kind: 'system', text: data.message },
            ]);
            return;
          case 'user_joined':
            setMessages((prev) => [
              ...prev,
              { kind: 'system', text: `${data.user.username} joined` },
            ]);
            return;
          case 'user_left':
            setMessages((prev) => [
              ...prev,
              { kind: 'system', text: `${data.user.username} left` },
            ]);
            return;
          default:
            setMessages((prev) => [
              ...prev,
              { kind: 'raw', text: event.data },
            ]);
        }
      } catch (parseError) {
        console.error('[CHAT SOCKET] parse error:', parseError);
        setMessages((prev) => [
          ...prev,
          { kind: 'raw', text: event.data },
        ]);
      }
    };

    return () => {
      console.log('[CHAT SOCKET] cleanup (effect unmounting)');
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      ws.current = null;
    };
  }, [enabled]);

  const send = (payload: unknown) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('[CHAT SOCKET] cannot send, socket state:',
        ws.current?.readyState,
        'payload:', payload
      );
      return;
    }
    console.log('[CHAT SOCKET] sending', payload);
    ws.current.send(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  };

  const sendMessage = (text: string) => {
    send(text);
  };

  return {
    messages,
    isConnected,
    sendMessage,
    send,
    lastRawMessage
  };
}

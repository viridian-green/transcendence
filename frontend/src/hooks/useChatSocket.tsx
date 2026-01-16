import { useEffect, useRef, useState } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '@/types/chat';

type ChatMessage = any;

export function useChatSocket(enabled: boolean) {
  const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRawMessage, setLastRawMessage] = useState<any | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/chat/websocket`;
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);

    socket.onmessage = (event) => {
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
      } catch {
        setMessages((prev) => [
          ...prev,
          { kind: 'raw', text: event.data },
        ]);
      }
    };

    return () => {
      socket.close();
      ws.current = null;
    };
  }, [enabled]);

  const send = (payload: unknown) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const asString =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    ws.current.send(asString);
  };

  const sendMessage = (text: string) => {
    send(text);
  };

  return { messages, isConnected, sendMessage, send, lastRawMessage };
}
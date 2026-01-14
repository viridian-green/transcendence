import { useEffect, useRef, useState } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '@/types/chat';

export function useChatSocket(enabled: boolean) {
  const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/chat/websocket`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = () => setIsConnected(false);

    ws.current.onmessage = (event) => {
      try {
        const data: ChatServerMessage = JSON.parse(event.data);
        switch (data.type) {
          case 'message':
            setMessages((prev) => [
              ...prev,
              { kind: 'chat', username: data.user?.username ?? data.username ?? 'unknown', text: data.text }
            ]);
            return;
          case 'welcome':
            setMessages((prev) => [...prev, { kind: 'system', text: data.message }]);
            return;
          case 'user_joined':
            setMessages((prev) => [...prev, { kind: 'system', text: `${data.user.username} joined` }]);
            return;
          case 'user_left':
            setMessages((prev) => [...prev, { kind: 'system', text: `${data.user.username} left` }]);
            return;
          default:
            setMessages((prev) => [...prev, { kind: 'raw', text: event.data }]);
        }
      } catch {
        setMessages((prev) => [...prev, { kind: 'raw', text: event.data }]);
      }
    };

    return () => ws.current?.close();
  }, [enabled]);

  const sendMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(text);
    }
  };

  return { messages, isConnected, sendMessage };
}